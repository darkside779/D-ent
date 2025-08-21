#!/bin/bash

# Script to generate self-signed SSL certificates for development
# DO NOT USE THESE CERTIFICATES IN PRODUCTION!

# Set variables
COUNTRY="US"
STATE="State"
LOCALITY="City"
ORGANIZATION="SmartExtract Pro"
ORGANIZATIONAL_UNIT="Development"
COMMON_NAME="localhost"
EMAIL="admin@example.com"
DAYS_VALID=365

# Create directory for SSL certificates if it doesn't exist
mkdir -p "$(dirname "$0")"

# Generate private key
openssl genrsa -out server.key 2048

# Generate CSR (Certificate Signing Request)
openssl req -new -key server.key -out server.csr -subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$COMMON_NAME/emailAddress=$EMAIL"

# Generate self-signed certificate
openssl x509 -req -days $DAYS_VALID -in server.csr -signkey server.key -out server.crt

# Create a combined PEM file (some applications need this format)
cat server.key server.crt > server.pem

# Set appropriate permissions
chmod 600 server.key server.pem
chmod 644 server.crt server.csr

# Display certificate information
echo "Self-signed certificate generated successfully!"
echo "Certificate details:"
openssl x509 -in server.crt -text -noout | grep -E 'Subject:|Issuer:|Not Before:|Not After :'

echo ""
echo "WARNING: This is a self-signed certificate for development purposes only."
echo "DO NOT USE IN PRODUCTION!"