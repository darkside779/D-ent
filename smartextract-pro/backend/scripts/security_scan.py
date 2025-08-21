#!/usr/bin/env python

import os
import re
import sys
import argparse
import colorama
from colorama import Fore, Style
from pathlib import Path

# Initialize colorama
colorama.init()

# Security vulnerability patterns to check for
VULNERABILITY_PATTERNS = {
    "hardcoded_secrets": {
        "pattern": r'(?i)(api_?key|secret|password|token|auth)\s*=\s*[\'"](\w+)[\'"]',
        "description": "Potential hardcoded secret or credential",
        "severity": "high",
        "exclude_patterns": [r'password_?hash', r'token_?hash', r'secret_?key\s*=\s*os\.getenv']
    },
    "sql_injection": {
        "pattern": r'(?i)execute\([\'"]\s*SELECT.*\%s.*[\'"]',
        "description": "Potential SQL injection vulnerability",
        "severity": "high",
        "exclude_patterns": []
    },
    "debug_enabled": {
        "pattern": r'(?i)debug\s*=\s*True',
        "description": "Debug mode enabled",
        "severity": "medium",
        "exclude_patterns": [r'if\s+settings\.debug', r'if\s+debug\s*==']
    },
    "insecure_hash": {
        "pattern": r'(?i)import\s+hashlib.*?([md5|sha1]\()',
        "description": "Use of insecure hash algorithm (MD5/SHA1)",
        "severity": "medium",
        "exclude_patterns": []
    },
    "eval_usage": {
        "pattern": r'\beval\s*\(',
        "description": "Use of eval() function (potential code injection)",
        "severity": "high",
        "exclude_patterns": []
    },
    "shell_injection": {
        "pattern": r'(?i)os\.system\(|subprocess\.(?:call|Popen|run)\([^,]*\$\{|shell\s*=\s*True',
        "description": "Potential shell injection vulnerability",
        "severity": "high",
        "exclude_patterns": []
    },
    "jwt_no_expiration": {
        "pattern": r'jwt\.encode\([^,]*\)',
        "description": "JWT token without expiration time",
        "severity": "medium",
        "exclude_patterns": [r'exp\s*:']
    },
    "weak_crypto": {
        "pattern": r'(?i)import\s+Crypto.Cipher.(DES|ARC2|ARC4|Blowfish)',
        "description": "Use of weak cryptographic algorithm",
        "severity": "high",
        "exclude_patterns": []
    },
    "pickle_usage": {
        "pattern": r'(?i)pickle\.loads?\(',
        "description": "Use of pickle module (potential code execution)",
        "severity": "medium",
        "exclude_patterns": []
    },
    "temp_file_race": {
        "pattern": r'(?i)tempfile\.mk(?:temp|stemp)\(',
        "description": "Potential temp file race condition",
        "severity": "low",
        "exclude_patterns": []
    },
    "cors_all_origins": {
        "pattern": r'(?i)allow_origins\s*=\s*["\']\*["\']',
        "description": "CORS allowing all origins (*)",
        "severity": "medium",
        "exclude_patterns": []
    }
}

# File extensions to scan
FILE_EXTENSIONS = [".py", ".pyw"]

# Directories to exclude
EXCLUDE_DIRS = ["venv", "env", ".venv", ".env", "__pycache__", ".git", "node_modules"]

def get_severity_color(severity):
    """Get color for severity level"""
    if severity == "high":
        return Fore.RED
    elif severity == "medium":
        return Fore.YELLOW
    else:  # low
        return Fore.BLUE

def should_exclude_file(file_path):
    """Check if file should be excluded from scanning"""
    parts = Path(file_path).parts
    return any(exclude_dir in parts for exclude_dir in EXCLUDE_DIRS)

def is_excluded_by_pattern(line, exclude_patterns):
    """Check if line matches any exclude pattern"""
    return any(re.search(pattern, line) for pattern in exclude_patterns)

def scan_file(file_path, verbose=False):
    """Scan a file for security vulnerabilities"""
    issues = []
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            lines = content.split('\n')
            
            for vuln_type, vuln_info in VULNERABILITY_PATTERNS.items():
                pattern = vuln_info["pattern"]
                exclude_patterns = vuln_info["exclude_patterns"]
                
                for i, line in enumerate(lines):
                    if re.search(pattern, line) and not is_excluded_by_pattern(line, exclude_patterns):
                        issues.append({
                            "file": file_path,
                            "line": i + 1,
                            "type": vuln_type,
                            "description": vuln_info["description"],
                            "severity": vuln_info["severity"],
                            "code": line.strip()
                        })
    except Exception as e:
        if verbose:
            print(f"{Fore.RED}Error scanning {file_path}: {str(e)}{Style.RESET_ALL}")
    
    return issues

def scan_directory(directory, verbose=False):
    """Recursively scan a directory for security vulnerabilities"""
    all_issues = []
    
    for root, dirs, files in os.walk(directory):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if any(file.endswith(ext) for ext in FILE_EXTENSIONS):
                file_path = os.path.join(root, file)
                
                if not should_exclude_file(file_path):
                    if verbose:
                        print(f"Scanning {file_path}...")
                    
                    file_issues = scan_file(file_path, verbose)
                    all_issues.extend(file_issues)
    
    return all_issues

def print_issues(issues):
    """Print found security issues"""
    if not issues:
        print(f"\n{Fore.GREEN}No security issues found!{Style.RESET_ALL}")
        return
    
    # Group issues by severity
    issues_by_severity = {"high": [], "medium": [], "low": []}
    for issue in issues:
        issues_by_severity[issue["severity"]].append(issue)
    
    # Print summary
    print(f"\n{Fore.CYAN}Security Scan Summary:{Style.RESET_ALL}")
    print(f"Total issues found: {len(issues)}")
    print(f"  High severity: {len(issues_by_severity['high'])}")
    print(f"  Medium severity: {len(issues_by_severity['medium'])}")
    print(f"  Low severity: {len(issues_by_severity['low'])}")
    
    # Print issues by severity
    for severity in ["high", "medium", "low"]:
        if issues_by_severity[severity]:
            severity_color = get_severity_color(severity)
            print(f"\n{severity_color}{severity.upper()} SEVERITY ISSUES:{Style.RESET_ALL}")
            
            for issue in issues_by_severity[severity]:
                print(f"\n{severity_color}[{issue['type']}]{Style.RESET_ALL} {issue['description']}")
                print(f"  File: {issue['file']}:{issue['line']}")
                print(f"  Code: {issue['code']}")

def main():
    parser = argparse.ArgumentParser(description='Security vulnerability scanner for Python code')
    parser.add_argument('directory', nargs='?', default='.', help='Directory to scan (default: current directory)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Enable verbose output')
    
    args = parser.parse_args()
    
    print(f"{Fore.CYAN}===== Python Security Vulnerability Scanner ====={Style.RESET_ALL}")
    print(f"Scanning directory: {os.path.abspath(args.directory)}")
    
    issues = scan_directory(args.directory, args.verbose)
    print_issues(issues)

if __name__ == '__main__':
    main()