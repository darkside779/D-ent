from fastapi import Request, HTTPException, status
from typing import Dict, Tuple, Optional, Callable
import time
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    Simple in-memory rate limiter to prevent brute force attacks
    and limit API usage per client.
    """
    def __init__(self, rate_limit: int = 60, time_window: int = 60):
        """
        Initialize rate limiter
        
        Args:
            rate_limit: Maximum number of requests allowed in the time window
            time_window: Time window in seconds
        """
        self.rate_limit = rate_limit
        self.time_window = time_window
        self.clients: Dict[str, Tuple[int, float]] = {}  # {client_id: (request_count, window_start)}
    
    def _get_client_id(self, request: Request) -> str:
        """
        Get a unique identifier for the client with improved IP detection
        
        Args:
            request: FastAPI request object
            
        Returns:
            Client identifier (IP address or forwarded IP)
        """
        # Check common proxy headers for client IP
        for header in ["X-Real-IP", "X-Forwarded-For"]:
            if header in request.headers:
                # Get the first IP in the chain
                ip = request.headers[header].split(",")[0].strip()
                if ip:
                    return ip
                    
        # Fall back to direct connection IP
        if request.client and hasattr(request.client, 'host'):
            return request.client.host
            
        # Last resort - use a default identifier
        return "unknown-client"
    
    async def __call__(self, request: Request):
        """
        Rate limit middleware with improved request counting and cleanup
        
        Args:
            request: FastAPI request object
            
        Raises:
            HTTPException: If rate limit is exceeded
        """
        client_id = self._get_client_id(request)
        current_time = time.time()
        
        # Clean up old entries periodically to prevent memory leaks
        if len(self.clients) > 1000:  # If we have too many clients, clean up
            self._cleanup_old_entries(current_time)
        
        # If client exists in the dictionary
        if client_id in self.clients:
            request_count, window_start = self.clients[client_id]
            
            # If the time window has expired, reset the counter
            if current_time - window_start > self.time_window:
                self.clients[client_id] = (1, current_time)
                logger.debug(f"Rate limit window reset for client {client_id}")
            else:
                # If the client has exceeded the rate limit
                if request_count >= self.rate_limit:
                    time_remaining = int(self.time_window - (current_time - window_start))
                    logger.warning(
                        f"Rate limit exceeded for client {client_id} "
                        f"({request_count} requests in {int(current_time - window_start)}s, "
                        f"limit: {self.rate_limit}/{self.time_window}s)"
                    )
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail={
                            "message": "Rate limit exceeded. Please try again later.",
                            "retry_after_seconds": time_remaining,
                            "limit": self.rate_limit,
                            "window_seconds": self.time_window
                        }
                    )
                # Increment the request count
                self.clients[client_id] = (request_count + 1, window_start)
                logger.debug(f"Request {request_count + 1}/{self.rate_limit} from {client_id}")
        else:
            # First request from this client in this window
            self.clients[client_id] = (1, current_time)
            logger.debug(f"New rate limit window started for client {client_id}")
            
    def _cleanup_old_entries(self, current_time: float):
        """Clean up old rate limit entries to prevent memory leaks"""
        expired_clients = [
            client_id for client_id, (_, window_start) in self.clients.items()
            if current_time - window_start > self.time_window * 2  # Keep entries for 2x the time window
        ]
        for client_id in expired_clients:
            del self.clients[client_id]
        if expired_clients:
            logger.debug(f"Cleaned up {len(expired_clients)} expired rate limit entries")


def create_rate_limiter(rate_limit: int = 60, time_window: int = 60) -> Callable:
    """
    Create a rate limiter dependency
    
    Args:
        rate_limit: Maximum number of requests allowed in the time window
        time_window: Time window in seconds
        
    Returns:
        Rate limiter dependency
    """
    limiter = RateLimiter(rate_limit, time_window)
    return limiter