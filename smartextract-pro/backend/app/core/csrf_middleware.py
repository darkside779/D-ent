from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from starlette.datastructures import MutableHeaders
from fastapi import FastAPI
import secrets
import time
import logging
from typing import Callable, Dict, Optional

logger = logging.getLogger(__name__)

class CSRFMiddleware(BaseHTTPMiddleware):
    """
    Middleware for CSRF protection.
    
    This middleware generates and validates CSRF tokens for protected routes.
    It uses double submit cookie pattern for CSRF protection.
    """
    
    def __init__(
        self,
        app: FastAPI,
        secret_key: str,
        cookie_name: str = "csrf_token",
        header_name: str = "X-CSRF-Token",
        cookie_secure: bool = True,
        cookie_httponly: bool = True,
        cookie_samesite: str = "Lax",
        cookie_max_age: int = 3600,  # 1 hour
        safe_methods: tuple = ("GET", "HEAD", "OPTIONS", "TRACE"),
        protected_paths: Optional[list] = None,
        debug: bool = False,
    ):
        super().__init__(app)
        self.secret_key = secret_key
        self.cookie_name = cookie_name
        self.header_name = header_name
        self.cookie_secure = cookie_secure
        self.cookie_httponly = cookie_httponly
        self.cookie_samesite = cookie_samesite
        self.cookie_max_age = cookie_max_age
        self.safe_methods = safe_methods
        self.protected_paths = protected_paths or ["/api/"]
        self._debug_mode = debug
        
        # Token cache to prevent replay attacks
        self.used_tokens: Dict[str, float] = {}
        
        # Clean up used tokens periodically
        self._cleanup_interval = 3600  # 1 hour
        self._last_cleanup = time.time()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Clean up used tokens if needed
        self._cleanup_used_tokens()
        
        # Skip CSRF check for OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            response = await call_next(request)
            return response
        
        # Skip CSRF check for safe methods
        if request.method in self.safe_methods:
            response = await call_next(request)
            # Set CSRF token cookie for GET requests to API endpoints
            if request.method == "GET" and self._is_protected_path(request.url.path):
                response = self._set_csrf_cookie(response)
            return response
        
        # Skip CSRF check for non-protected paths
        if not self._is_protected_path(request.url.path):
            return await call_next(request)
        
        # For development, allow requests without CSRF tokens
        # In production, this should be strict
        if hasattr(self, '_debug_mode') and self._debug_mode:
            logger.info("Development mode: Skipping CSRF validation")
            response = await call_next(request)
            response = self._set_csrf_cookie(response)
            return response
        
        # Validate CSRF token for protected paths and unsafe methods
        try:
            csrf_cookie = request.cookies.get(self.cookie_name)
            csrf_header = request.headers.get(self.header_name)
            
            if not csrf_cookie or not csrf_header:
                logger.warning(f"CSRF token missing: cookie={bool(csrf_cookie)}, header={bool(csrf_header)}")
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CSRF token missing or invalid"}
                )
            
            if csrf_cookie != csrf_header:
                logger.warning("CSRF token mismatch")
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CSRF token mismatch"}
                )
            
            # Check if token has been used before (prevent replay attacks)
            if csrf_cookie in self.used_tokens:
                logger.warning("CSRF token reuse detected")
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CSRF token already used"}
                )
            
            # Mark token as used
            self.used_tokens[csrf_cookie] = time.time()
            
            # Continue with the request
            response = await call_next(request)
            
            # Generate a new CSRF token for the next request
            response = self._set_csrf_cookie(response)
            
            return response
            
        except Exception as e:
            logger.error(f"CSRF validation error: {str(e)}")
            return JSONResponse(
                status_code=403,
                content={"detail": "CSRF validation failed"}
            )
    
    def _is_protected_path(self, path: str) -> bool:
        """
        Check if the path should be protected by CSRF.
        """
        return any(path.startswith(protected) for protected in self.protected_paths)
    
    def _set_csrf_cookie(self, response: Response) -> Response:
        """
        Set a new CSRF token cookie in the response.
        """
        token = secrets.token_hex(32)
        
        # If the response doesn't have headers yet, create them
        if not hasattr(response, "headers"):
            response.headers = MutableHeaders()
        
        # Set the CSRF token cookie
        cookie_value = f"{self.cookie_name}={token}; Path=/; Max-Age={self.cookie_max_age}; SameSite={self.cookie_samesite}"
        
        if self.cookie_secure:
            cookie_value += "; Secure"
        
        if self.cookie_httponly:
            cookie_value += "; HttpOnly"
        
        response.headers.append("Set-Cookie", cookie_value)
        
        return response
    
    def _cleanup_used_tokens(self) -> None:
        """
        Clean up expired tokens from the used tokens cache.
        """
        current_time = time.time()
        
        # Only clean up periodically
        if current_time - self._last_cleanup < self._cleanup_interval:
            return
        
        # Remove tokens older than max_age
        expired_time = current_time - self.cookie_max_age
        self.used_tokens = {token: timestamp for token, timestamp in self.used_tokens.items() if timestamp > expired_time}
        
        self._last_cleanup = current_time

def setup_csrf_middleware(app: FastAPI, secret_key: str, debug: bool = False) -> None:
    """
    Set up CSRF protection middleware for the FastAPI application.
    
    Args:
        app: The FastAPI application
        secret_key: Secret key for CSRF token generation
        debug: Whether the application is in debug mode
    """ 
    if debug:
        # In debug mode, only protect sensitive endpoints, not all API endpoints
        protected_paths = ["/api/v1/auth/", "/api/v1/users/"]  # Only protect auth and user management
    else:
        # In production, protect all API endpoints
        protected_paths = ["/api/v1/"]
    
    app.add_middleware(
        CSRFMiddleware,
        secret_key=secret_key,
        cookie_secure=not debug,  # In production, require HTTPS
        protected_paths=protected_paths,
        debug=debug,
    )