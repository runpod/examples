#!/usr/bin/env python3
"""
Perpetual file downloader for Runpod network volumes.
Downloads all files from a remote folder and removes them after successful download.
Uses AWS CLI instead of Boto3.
"""

import subprocess
import os
import time
import sys
from pathlib import Path

# Configuration
# Refer to https://docs.runpod.io/storage/s3-api for datacenters and endpoint URLs

ACCESS_KEY = 'ACCESS_KEY_HERE'
SECRET_KEY = 'SECRET_KEY_HERE'
NETWORK_VOLUME_ID = 'VOLUME_ID_HERE'
DATACENTER = 'DATA_CENTER_HERE'
ENDPOINT_URL = 'ENDPOINT_URL_HERE'

# Remote folder to monitor (empty string means root of network volume)
REMOTE_FOLDER = 'ComfyUI/output/video'  # Change this to monitor a specific folder, e.g., 'data/outputs/'

# Local download directory
LOCAL_DOWNLOAD_DIR = './downloads'

# Check interval in seconds
CHECK_INTERVAL = 30


def setup_aws_credentials():
    """Set AWS credentials as environment variables for AWS CLI."""
    os.environ['AWS_ACCESS_KEY_ID'] = ACCESS_KEY
    os.environ['AWS_SECRET_ACCESS_KEY'] = SECRET_KEY
    print("✓ AWS credentials configured")


def run_aws_command(command):
    """
    Execute an AWS CLI command and return the result.
    
    Args:
        command: List of command arguments
        
    Returns:
        tuple: (success: bool, output: str, error: str)
    """
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=False
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)


def list_remote_files():
    """
    List all files in the remote folder.
    Uses non-recursive listing to avoid Runpod pagination issues.
    
    Returns:
        list: List of file paths
    """
    s3_path = f"s3://{NETWORK_VOLUME_ID}/"
    if REMOTE_FOLDER:
        s3_path += REMOTE_FOLDER.rstrip('/') + '/'
    
    print(f"Listing files in: {s3_path}")
    
    # Use non-recursive listing to avoid pagination bug
    # Note: Using lowercase region as AWS CLI is case-sensitive
    command = [
        'aws', 's3', 'ls',
        s3_path,
        '--endpoint-url', ENDPOINT_URL,
        '--region', DATACENTER.lower()  # AWS CLI expects lowercase region
    ]
    
    print(f"Running command: {' '.join(command)}")
    
    success, output, error = run_aws_command(command)
    
    print(f"Command success: {success}")
    if output:
        print(f"Output:\n{output}")
    if error:
        print(f"Error:\n{error}")
    
    if not success:
        if 'NoSuchBucket' in error:
            print(f"✗ Network volume '{NETWORK_VOLUME_ID}' not found")
        elif error:
            print(f"✗ Error listing files: {error}")
        return []
    
    files = []
    subdirs = []
    
    for line in output.strip().split('\n'):
        if line.strip():
            # Parse AWS S3 ls output
            # Directories: "PRE subfolder/"
            # Files: "2024-01-01 12:00:00 1234 file.txt"
            if line.strip().startswith('PRE '):
                # This is a subdirectory
                subdir = line.split('PRE ', 1)[1].strip()
                subdirs.append(subdir)
                print(f"Found subdirectory: {subdir}")
            else:
                parts = line.split(None, 3)
                if len(parts) == 4:
                    filename = parts[3]
                    # Construct full path
                    if REMOTE_FOLDER:
                        full_path = f"{REMOTE_FOLDER.rstrip('/')}/{filename}"
                    else:
                        full_path = filename
                    files.append(full_path)
                    print(f"Found file: {full_path}")
    
    # Recursively list subdirectories
    for subdir in subdirs:
        print(f"Recursing into subdirectory: {subdir}")
        if REMOTE_FOLDER:
            subdir_path = f"{REMOTE_FOLDER.rstrip('/')}/{subdir}"
        else:
            subdir_path = subdir
        
        subfiles = list_remote_files_in_path(subdir_path)
        files.extend(subfiles)
    
    print(f"Total files found: {len(files)}")
    return files


def list_remote_files_in_path(remote_path):
    """
    Helper function to list files in a specific path.
    
    Args:
        remote_path: Path to list (e.g., 'ComfyUI/output/video/')
        
    Returns:
        list: List of file paths
    """
    s3_path = f"s3://{NETWORK_VOLUME_ID}/{remote_path}"
    if not s3_path.endswith('/'):
        s3_path += '/'
    
    command = [
        'aws', 's3', 'ls',
        s3_path,
        '--endpoint-url', ENDPOINT_URL,
        '--region', DATACENTER.lower()  # AWS CLI expects lowercase region
    ]
    
    success, output, error = run_aws_command(command)
    
    if not success:
        return []
    
    files = []
    subdirs = []
    
    for line in output.strip().split('\n'):
        if line.strip():
            if line.strip().startswith('PRE '):
                subdir = line.split('PRE ', 1)[1].strip()
                subdirs.append(subdir)
            else:
                parts = line.split(None, 3)
                if len(parts) == 4:
                    filename = parts[3]
                    full_path = f"{remote_path.rstrip('/')}/{filename}"
                    files.append(full_path)
    
    # Recursively list subdirectories
    for subdir in subdirs:
        subdir_path = f"{remote_path.rstrip('/')}/{subdir}"
        subfiles = list_remote_files_in_path(subdir_path)
        files.extend(subfiles)
    
    return files


def download_file(remote_path, local_path):
    """
    Download a file from the network volume.
    
    Args:
        remote_path: Path on the network volume
        local_path: Local destination path
        
    Returns:
        bool: True if successful, False otherwise
    """
    s3_path = f"s3://{NETWORK_VOLUME_ID}/{remote_path}"
    
    # Create local directory if it doesn't exist
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    
    command = [
        'aws', 's3', 'cp',
        s3_path,
        local_path,
        '--endpoint-url', ENDPOINT_URL,
        '--region', DATACENTER.lower()  # AWS CLI expects lowercase region
    ]
    
    success, output, error = run_aws_command(command)
    
    if success:
        print(f"  ✓ Downloaded: {remote_path}")
        return True
    else:
        print(f"  ✗ Failed to download {remote_path}: {error}")
        return False


def remove_remote_file(remote_path):
    """
    Remove a file from the network volume.
    
    Args:
        remote_path: Path on the network volume
        
    Returns:
        bool: True if successful, False otherwise
    """
    s3_path = f"s3://{NETWORK_VOLUME_ID}/{remote_path}"
    
    command = [
        'aws', 's3', 'rm',
        s3_path,
        '--endpoint-url', ENDPOINT_URL,
        '--region', DATACENTER.lower()  # AWS CLI expects lowercase region
    ]
    
    success, output, error = run_aws_command(command)
    
    if success:
        print(f"  ✓ Removed: {remote_path}")
        return True
    else:
        print(f"  ✗ Failed to remove {remote_path}: {error}")
        return False


def process_files():
    """
    Download and remove all files from the remote folder.
    
    Returns:
        int: Number of files processed
    """
    files = list_remote_files()
    
    if not files:
        return 0
    
    print(f"\nFound {len(files)} file(s) to process")
    
    processed_count = 0
    for remote_path in files:
        # Create local path maintaining directory structure
        local_path = os.path.join(LOCAL_DOWNLOAD_DIR, remote_path)
        
        print(f"\nProcessing: {remote_path}")
        
        # Download the file
        if download_file(remote_path, local_path):
            # Only remove if download was successful
            if remove_remote_file(remote_path):
                processed_count += 1
            else:
                print(f"  ⚠ File downloaded but not removed from remote")
        else:
            print(f"  ⚠ Skipping removal due to download failure")
    
    return processed_count


def check_aws_cli():
    """Check if AWS CLI is installed."""
    try:
        result = subprocess.run(
            ['aws', '--version'],
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode == 0:
            print(f"✓ AWS CLI found: {result.stdout.strip()}")
            return True
        else:
            print("✗ AWS CLI not responding correctly")
            return False
    except FileNotFoundError:
        print("✗ AWS CLI not found. Please install it first:")
        print("  pip install awscli")
        print("  or visit: https://aws.amazon.com/cli/")
        return False


def main():
    """Main loop that continuously monitors and downloads files."""
    print("=" * 60)
    print("Runpod Network Volume File Downloader")
    print("=" * 60)
    print(f"Network Volume: {NETWORK_VOLUME_ID}")
    print(f"Datacenter: {DATACENTER}")
    print(f"Remote folder: {REMOTE_FOLDER or '(root)'}")
    print(f"Local directory: {LOCAL_DOWNLOAD_DIR}")
    print(f"Check interval: {CHECK_INTERVAL}s")
    print("=" * 60)
    
    # Check prerequisites
    if not check_aws_cli():
        sys.exit(1)
    
    setup_aws_credentials()
    
    # Create local download directory
    os.makedirs(LOCAL_DOWNLOAD_DIR, exist_ok=True)
    print(f"✓ Local download directory ready: {LOCAL_DOWNLOAD_DIR}")
    
    print("\nStarting monitoring loop (Press Ctrl+C to stop)...\n")
    
    cycle_count = 0
    total_processed = 0
    
    try:
        while True:
            cycle_count += 1
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n[{timestamp}] Cycle #{cycle_count}")
            print("-" * 60)
            
            processed = process_files()
            total_processed += processed
            
            if processed > 0:
                print(f"\n✓ Processed {processed} file(s) this cycle")
                print(f"  Total processed: {total_processed}")
            else:
                print("No files found")
            
            print(f"\nWaiting {CHECK_INTERVAL}s before next check...")
            time.sleep(CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 60)
        print("Shutting down gracefully...")
        print(f"Total files processed: {total_processed}")
        print("=" * 60)
        sys.exit(0)


if __name__ == "__main__":
    main()
