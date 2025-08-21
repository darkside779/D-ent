#!/usr/bin/env python

import os
import sys
import re
import requests
from dotenv import load_dotenv
import colorama
from colorama import Fore, Style

# Initialize colorama
colorama.init()

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

def print_status(message, status, details=None):
    """
    Print a status message with color coding
    
    Args:
        message: The message to print
        status: 'pass', 'warn', or 'fail'
        details: Optional details to print
    """
    if status == 'pass':
        status_color = Fore.GREEN
        status_text = 'PASS'
    elif status == 'warn':
        status_color = Fore.YELLOW
        status_text = 'WARN'
    else:  # fail
        status_color = Fore.RED
        status_text = 'FAIL'
    
    print(f"{message:.<50} [{status_color}{status_text}{Style.RESET_ALL}]")
    
    if details:
        print(f"  {Fore.BLUE}Details:{Style.RESET_ALL} {details}")

def check_secret_key():
    """
    Check if the SECRET_KEY is secure
    """
    secret_key = os.getenv('SECRET_KEY')
    
    if not secret_key:
        print_status("SECRET_KEY is set", "fail", "SECRET_KEY is not set")
        return
    
    if len(secret_key) < 32:
        print_status("SECRET_KEY length", "warn", f"SECRET_KEY is only {len(secret_key)} characters long. Recommend at least 32 characters.")
    else:
        print_status("SECRET_KEY length", "pass")
    
    if secret_key == 'your-secret-key-here123' or secret_key == 'replace_with_secure_key_at_least_32_chars_long':
        print_status("SECRET_KEY is unique", "fail", "SECRET_KEY is using the default value")
    else:
        print_status("SECRET_KEY is unique", "pass")

def check_debug_mode():
    """
    Check if DEBUG mode is disabled in production
    """
    debug = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't', 'yes')
    
    if debug:
        print_status("DEBUG mode", "warn", "DEBUG mode is enabled. This should be disabled in production.")
    else:
        print_status("DEBUG mode", "pass")

def check_database_url():
    """
    Check if the DATABASE_URL is secure and not using SQLite in production
    """
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print_status("DATABASE_URL is set", "fail", "DATABASE_URL is not set")
        return
    
    if database_url.startswith('sqlite'):
        print_status("DATABASE_URL is production-ready", "warn", "Using SQLite database. Consider using PostgreSQL for production.")
    else:
        print_status("DATABASE_URL is production-ready", "pass")
    
    # Check if the database URL contains credentials in an insecure format
    if re.search(r'://[^:]+:[^@]+@', database_url) and not database_url.startswith('sqlite'):
        print_status("DATABASE_URL credentials", "warn", "DATABASE_URL contains embedded credentials. Consider using environment variables or a secrets manager.")
    else:
        print_status("DATABASE_URL credentials", "pass")

def check_cors_settings():
    """
    Check if CORS settings are secure
    """
    cors_origins = os.getenv('BACKEND_CORS_ORIGINS', '')
    
    if not cors_origins:
        print_status("CORS origins", "warn", "BACKEND_CORS_ORIGINS is not set. This may allow any origin in development mode.")
        return
    
    if cors_origins == '*' or 'localhost' in cors_origins:
        print_status("CORS origins", "warn", "CORS is configured to allow localhost or all origins. Restrict this in production.")
    else:
        print_status("CORS origins", "pass")

def check_jwt_settings():
    """
    Check if JWT settings are secure
    """
    algorithm = os.getenv('ALGORITHM')
    token_expire = os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES')
    
    if not algorithm:
        print_status("JWT algorithm", "fail", "ALGORITHM is not set")
    elif algorithm != 'HS256':
        print_status("JWT algorithm", "warn", f"Using {algorithm} algorithm. HS256 is recommended for most cases.")
    else:
        print_status("JWT algorithm", "pass")
    
    if not token_expire:
        print_status("Token expiration", "fail", "ACCESS_TOKEN_EXPIRE_MINUTES is not set")
    elif int(token_expire) > 60 * 24:  # More than 24 hours
        print_status("Token expiration", "warn", f"Token expiration is set to {token_expire} minutes. Consider using a shorter expiration time for security.")
    else:
        print_status("Token expiration", "pass")

def main():
    print(f"{Fore.CYAN}===== SmartExtract Pro Security Check ====={Style.RESET_ALL}\n")
    
    # Check environment variables
    print(f"{Fore.CYAN}Checking environment variables...{Style.RESET_ALL}")
    check_secret_key()
    check_debug_mode()
    check_database_url()
    check_cors_settings()
    check_jwt_settings()
    
    print("\nSecurity check complete.")

if __name__ == '__main__':
    main()