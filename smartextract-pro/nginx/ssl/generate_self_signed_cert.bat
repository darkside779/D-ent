@echo off
REM Script to generate self-signed SSL certificates for development on Windows
REM DO NOT USE THESE CERTIFICATES IN PRODUCTION!

REM Set variables
set COUNTRY=US
set STATE=State
set LOCALITY=City
set ORGANIZATION=SmartExtract Pro
set ORGANIZATIONAL_UNIT=Development
set COMMON_NAME=localhost
set EMAIL=admin@example.com
set DAYS_VALID=365

REM Check if OpenSSL is available
where openssl >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo OpenSSL is not installed or not in PATH.
    echo Please install OpenSSL and try again.
    exit /b 1
)

REM Generate private key
echo Generating private key...
openssl genrsa -out server.key 2048

REM Generate CSR (Certificate Signing Request)
echo Generating certificate signing request...
openssl req -new -key server.key -out server.csr -subj "/C=%COUNTRY%/ST=%STATE%/L=%LOCALITY%/O=%ORGANIZATION%/OU=%ORGANIZATIONAL_UNIT%/CN=%COMMON_NAME%/emailAddress=%EMAIL%"

REM Generate self-signed certificate
echo Generating self-signed certificate...
openssl x509 -req -days %DAYS_VALID% -in server.csr -signkey server.key -out server.crt

REM Create a combined PEM file (some applications need this format)
echo Creating combined PEM file...
type server.key server.crt > server.pem

REM Display certificate information
echo.
echo Self-signed certificate generated successfully!
echo Certificate details:
openssl x509 -in server.crt -text -noout | findstr /C:"Subject:" /C:"Issuer:" /C:"Not Before:" /C:"Not After :"

echo.
echo WARNING: This is a self-signed certificate for development purposes only.
echo DO NOT USE IN PRODUCTION!

pause