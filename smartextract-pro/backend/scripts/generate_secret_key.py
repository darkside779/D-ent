#!/usr/bin/env python

import secrets
import os
import argparse

def generate_secret_key(length=32):
    """
    Generate a secure random secret key
    
    Args:
        length: Length of the key in bytes (default: 32)
        
    Returns:
        Hexadecimal string representation of the key
    """
    return secrets.token_hex(length)

def update_env_file(env_file, new_key):
    """
    Update the SECRET_KEY in the .env file
    
    Args:
        env_file: Path to the .env file
        new_key: New secret key to set
    """
    if not os.path.exists(env_file):
        print(f"Error: {env_file} does not exist")
        return False
    
    with open(env_file, 'r') as f:
        lines = f.readlines()
    
    with open(env_file, 'w') as f:
        for line in lines:
            if line.startswith('SECRET_KEY='):
                f.write(f"SECRET_KEY={new_key}\n")
            else:
                f.write(line)
    
    return True

def main():
    parser = argparse.ArgumentParser(description='Generate a secure secret key for SmartExtract Pro')
    parser.add_argument('--length', type=int, default=32, help='Length of the key in bytes')
    parser.add_argument('--update-env', action='store_true', help='Update the .env file with the new key')
    parser.add_argument('--env-file', default='.env', help='Path to the .env file')
    
    args = parser.parse_args()
    
    # Generate the key
    key = generate_secret_key(args.length)
    
    # Print the key
    print(f"Generated secret key: {key}")
    
    # Update the .env file if requested
    if args.update_env:
        if update_env_file(args.env_file, key):
            print(f"Updated {args.env_file} with the new secret key")
        else:
            print(f"Failed to update {args.env_file}")
    
    print("\nTo use this key, set it as the SECRET_KEY in your .env file:")
    print(f"SECRET_KEY={key}")

if __name__ == '__main__':
    main()