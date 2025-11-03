#!/usr/bin/env python3
"""
Perpetual file downloader for Runpod network volumes using Boto3.
Downloads all files from a remote folder and removes them after successful download.
Uses Boto3 library instead of AWS CLI.
"""

import boto3
from botocore.exceptions import ClientError
import os
import time
import sys
from pathlib import Path

# Refer to https://docs.runpod.io/storage/s3-api for datacenters and endpoint URLs

ACCESS_KEY = 'ACCESS_KEY_HERE' # begins with user_
SECRET_KEY = 'SECRET_KEY_HERE' # begins with rps_
NETWORK_VOLUME_ID = 'VOLUME_ID_HERE' # pulled from network volume page, e.g. jn6d4a9b1x
DATACENTER = 'us-ks-2' # e.g. us-ks-2; lowercase for Boto3. See docs page
ENDPOINT_URL = 'https://s3api-us-ks-2.runpod.io/' # each DC has its own endpoint

# Remote folder to monitor (empty string means root of network volume)
REMOTE_FOLDER = 'ComfyUI/output'  # Change this to monitor a specific folder

# Local download directory
LOCAL_DOWNLOAD_DIR = './downloads'

# Check interval in seconds
CHECK_INTERVAL = 30


def create_s3_client():
    """
    Create and return a configured S3 client for Runpod.
    
    Returns:
        boto3.client: Configured S3 client
    """
    try:
        client = boto3.client(
            's3',
            aws_access_key_id=ACCESS_KEY,
            aws_secret_access_key=SECRET_KEY,
            region_name=DATACENTER,
            endpoint_url=ENDPOINT_URL
        )
        print("✓ S3 client created successfully")
        return client
    except Exception as e:
        print(f"✗ Failed to create S3 client: {e}")
        sys.exit(1)


def list_remote_files(s3_client):
    """
    List all files in the remote folder recursively.
    Uses delimiter-based listing to avoid Runpod pagination bug.
    
    Args:
        s3_client: Boto3 S3 client
        
    Returns:
        list: List of file keys (paths)
    """
    prefix = REMOTE_FOLDER.rstrip('/') + '/' if REMOTE_FOLDER else ''
    return list_files_in_prefix(s3_client, prefix)


def list_files_in_prefix(s3_client, prefix):
    """
    List files in a specific prefix using delimiter to avoid pagination issues.
    Recursively processes subdirectories.
    
    Args:
        s3_client: Boto3 S3 client
        prefix: S3 prefix (folder path) to list
        
    Returns:
        list: List of file keys (paths)
    """
    files = []
    
    try:
        # Use delimiter to list one level at a time (avoids pagination bug)
        response = s3_client.list_objects_v2(
            Bucket=NETWORK_VOLUME_ID,
            Prefix=prefix,
            Delimiter='/'
        )
        
        # Get files in current directory
        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                # Skip the prefix itself and empty directories
                if key != prefix and not key.endswith('/'):
                    files.append(key)
        
        # Get subdirectories and recurse into them
        if 'CommonPrefixes' in response:
            for prefix_obj in response['CommonPrefixes']:
                subdir_prefix = prefix_obj['Prefix']
                # Recursively list files in subdirectory
                subfiles = list_files_in_prefix(s3_client, subdir_prefix)
                files.extend(subfiles)
                
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NoSuchBucket':
            print(f"✗ Network volume '{NETWORK_VOLUME_ID}' not found")
        else:
            print(f"✗ Error listing prefix '{prefix}': {e}")
    except Exception as e:
        print(f"✗ Unexpected error listing prefix '{prefix}': {e}")
    
    return files


def download_file(s3_client, remote_path, local_path):
    """
    Download a file from the network volume.
    
    Args:
        s3_client: Boto3 S3 client
        remote_path: Key (path) on the network volume
        local_path: Local destination path
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Create local directory if it doesn't exist
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        # Download the file
        s3_client.download_file(NETWORK_VOLUME_ID, remote_path, local_path)
        print(f"  ✓ Downloaded: {remote_path}")
        return True
        
    except ClientError as e:
        print(f"  ✗ Failed to download {remote_path}: {e}")
        return False
    except Exception as e:
        print(f"  ✗ Unexpected error downloading {remote_path}: {e}")
        return False


def remove_remote_file(s3_client, remote_path):
    """
    Remove a file from the network volume.
    
    Args:
        s3_client: Boto3 S3 client
        remote_path: Key (path) on the network volume
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        s3_client.delete_object(Bucket=NETWORK_VOLUME_ID, Key=remote_path)
        print(f"  ✓ Removed: {remote_path}")
        return True
        
    except ClientError as e:
        print(f"  ✗ Failed to remove {remote_path}: {e}")
        return False
    except Exception as e:
        print(f"  ✗ Unexpected error removing {remote_path}: {e}")
        return False


def process_files(s3_client):
    """
    Download and remove all files from the remote folder.
    
    Args:
        s3_client: Boto3 S3 client
        
    Returns:
        int: Number of files processed
    """
    files = list_remote_files(s3_client)
    
    if not files:
        return 0
    
    print(f"\nFound {len(files)} file(s) to process")
    
    processed_count = 0
    for remote_path in files:
        # Create local path maintaining directory structure
        local_path = os.path.join(LOCAL_DOWNLOAD_DIR, remote_path)
        
        print(f"\nProcessing: {remote_path}")
        
        # Download the file
        if download_file(s3_client, remote_path, local_path):
            # Only remove if download was successful
            if remove_remote_file(s3_client, remote_path):
                processed_count += 1
            else:
                print(f"  ⚠ File downloaded but not removed from remote")
        else:
            print(f"  ⚠ Skipping removal due to download failure")
    
    return processed_count


def test_connection(s3_client):
    """
    Test the connection to the network volume.
    
    Args:
        s3_client: Boto3 S3 client
        
    Returns:
        bool: True if connection successful
    """
    try:
        # Try to list buckets to verify connection
        s3_client.head_bucket(Bucket=NETWORK_VOLUME_ID)
        print(f"✓ Successfully connected to network volume: {NETWORK_VOLUME_ID}")
        return True
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            print(f"✗ Network volume '{NETWORK_VOLUME_ID}' not found")
        elif error_code == '403':
            print(f"✗ Access denied to network volume '{NETWORK_VOLUME_ID}'")
            print("  Check your credentials and permissions")
        else:
            print(f"✗ Error connecting to network volume: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error testing connection: {e}")
        return False


def check_boto3():
    """Check if Boto3 is installed."""
    try:
        import boto3
        print(f"✓ Boto3 found: version {boto3.__version__}")
        return True
    except ImportError:
        print("✗ Boto3 not found. Please install it first:")
        print("  pip install boto3")
        return False


def main():
    """Main loop that continuously monitors and downloads files."""
    print("=" * 60)
    print("Runpod Network Volume File Downloader (Boto3)")
    print("=" * 60)
    print(f"Network Volume: {NETWORK_VOLUME_ID}")
    print(f"Datacenter: {DATACENTER}")
    print(f"Endpoint: {ENDPOINT_URL}")
    print(f"Remote folder: {REMOTE_FOLDER or '(root)'}")
    print(f"Local directory: {LOCAL_DOWNLOAD_DIR}")
    print(f"Check interval: {CHECK_INTERVAL}s")
    print("=" * 60)
    
    # Check prerequisites
    if not check_boto3():
        sys.exit(1)
    
    # Create S3 client
    s3_client = create_s3_client()
    
    # Test connection
    if not test_connection(s3_client):
        sys.exit(1)
    
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
            
            processed = process_files(s3_client)
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
    except Exception as e:
        print(f"\n\n✗ Unexpected error: {e}")
        print(f"Total files processed before error: {total_processed}")
        sys.exit(1)


if __name__ == "__main__":
    main()
