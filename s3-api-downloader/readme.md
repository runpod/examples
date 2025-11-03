# Runpod Network Volume File Sync

A lightweight Python script that continuously monitors a Runpod network volume, downloads new files, and automatically removes them after successful download. Perfect for automated file collection from Runpod instances without needing to keep a Pod running.

Includes both AWS CLI and boto3 implementations in two seperate scripts.

## ✨ Features

- 🔄 **Perpetual monitoring** - Runs continuously with configurable check intervals
- 📥 **Automatic downloads** - Pulls all files from specified remote folders
- 🗑️ **Safe cleanup** - Only removes remote files after confirming successful download
- 🔧 **AWS CLI based** - Uses standard AWS CLI tools (no Boto3 required)
- 📂 **Directory preservation** - Maintains original folder structure in downloads
- 🐛 **Error handling** - Robust error handling with detailed logging
- 🔍 **Debug mode** - Comprehensive progress reporting and diagnostics

## 📋 Prerequisites

1. **Python 3.6+** (uses only standard library)
2. **AWS CLI** installed and accessible:
   ```bash
   pip install awscli
   ```
3. **Runpod S3 API credentials** - Obtain from [Runpod Console Settings](https://www.console.runpod.io/user/settings)

## 🚀 Quick Start

### 1. Configure the Script

Edit the configuration variables at the top of `downloader.py`:

```python
# Your Runpod credentials
ACCESS_KEY = 'user_2vHLfBBGYlhiWhSBi7RWLCPf7Sl'
SECRET_KEY = 'rps_CB8781A2KZ1SVADZZT4CFI5E5LWZZYP5A01SDWVWn10vg9'
NETWORK_VOLUME_ID = 'oijq0arb1f'
DATACENTER = 'US-KS-2'

# Remote folder to monitor
REMOTE_FOLDER = 'ComfyUI/output'  # or '' for root

# Local download directory
LOCAL_DOWNLOAD_DIR = './downloads'

# Check interval in seconds
CHECK_INTERVAL = 30
```

### 2. Run the Script

```bash
# Make executable (optional)
chmod +x runpod_sync.py

# Run directly
python runpod_sync.py

# Or if executable
./runpod_sync.py
```

### 3. Stop the Script

Press `Ctrl+C` to gracefully shut down.

## 📖 Detailed Configuration

### Runpod Datacenters

Available datacenters and their endpoint URLs:

| Datacenter | Endpoint URL |
|------------|--------------|
| `EUR-IS-1` | `https://s3api-eur-is-1.runpod.io/` |
| `EU-RO-1` | `https://s3api-eu-ro-1.runpod.io/` |
| `EU-CZ-1` | `https://s3api-eu-cz-1.runpod.io/` |
| `US-KS-2` | `https://s3api-us-ks-2.runpod.io/` |
| `US-CA-2` | `https://s3api-us-ca-2.runpod.io/` |

Update the `DATACENTER` and `ENDPOINT_URL` variables to match your network volume's location.

### Customizable Parameters

```python
# Monitor a specific folder
REMOTE_FOLDER = 'data/outputs/'      # Specific folder
REMOTE_FOLDER = 'ComfyUI/output'     # Nested folder
REMOTE_FOLDER = ''                    # Root of volume

# Change download location
LOCAL_DOWNLOAD_DIR = './downloads'    # Relative path
LOCAL_DOWNLOAD_DIR = '/home/user/data'  # Absolute path

# Adjust polling frequency
CHECK_INTERVAL = 30   # Check every 30 seconds
CHECK_INTERVAL = 300  # Check every 5 minutes
```

## 💡 Usage Examples

### Basic Usage

Monitor a folder and download all files:

```bash
python downloader.py
```

### Safety Features

- **Atomic operations**: Files are only deleted after successful download
- **Non-recursive listing**: Avoids Runpod's pagination bugs
- **Error recovery**: Failed downloads are retried on next cycle
- **Graceful shutdown**: Ctrl+C exits cleanly with summary statistics

## 📊 Sample Output

```
============================================================
Runpod Network Volume File Downloader
============================================================
Network Volume: oijq0arb1f
Datacenter: US-KS-2
Remote folder: ComfyUI/output
Local directory: ./downloads
Check interval: 30s
============================================================
✓ AWS CLI found: aws-cli/2.31.22 Python/3.13.7 Linux/6.14.0
✓ AWS credentials configured
✓ Local download directory ready: ./downloads

Starting monitoring loop (Press Ctrl+C to stop)...

[2025-10-27 18:30:00] Cycle #1
------------------------------------------------------------
Listing files in: s3://oijq0arb1f/ComfyUI/output/
Found subdirectory: video/
Found file: ComfyUI/output/ComfyUI_00001_.mp4
Recursing into subdirectory: video/
Found file: ComfyUI/output/video/animation_001.mp4
Total files found: 2

Found 2 file(s) to process

Processing: ComfyUI/output/ComfyUI_00001_.mp4
  ✓ Downloaded: ComfyUI/output/ComfyUI_00001_.mp4
  ✓ Removed: ComfyUI/output/ComfyUI_00001_.mp4

Processing: ComfyUI/output/video/animation_001.mp4
  ✓ Downloaded: ComfyUI/output/video/animation_001.mp4
  ✓ Removed: ComfyUI/output/video/animation_001.mp4

✓ Processed 2 file(s) this cycle
  Total processed: 2

Waiting 30s before next check...
```

## 🐛 Troubleshooting

### AWS CLI Not Found

**Error**: `✗ AWS CLI not found`

**Solution**:
```bash
pip install awscli
# or
pip3 install awscli
```

### No Files Found

**Issue**: Script shows "No files found" but files exist

**Solutions**:
1. Verify `REMOTE_FOLDER` is set correctly (no leading slash)
2. Check datacenter matches your network volume location
3. Ensure credentials are correct
4. Test manually:
   ```bash
   aws s3 ls --region us-ks-2 \
       --endpoint-url https://s3api-us-ks-2.runpod.io \
       s3://YOUR_VOLUME_ID/YOUR_FOLDER/
   ```

### "Same Next Token" Pagination Error

**Error**: `The same next token was received twice`

**Solution**: The script already handles this by avoiding `--recursive` flag. If you still see this error, the directory might have too many files (>10,000). Consider:
- Breaking up into smaller subdirectories
- Processing files in batches
- Increasing `CHECK_INTERVAL` to allow more time

## 🙏 Acknowledgments

- Built for the [Runpod](https://runpod.io) platform
- Uses AWS CLI for S3-compatible API access
- Implements workarounds for Runpod's S3 API pagination limitations

## 📞 Support

- **Runpod Documentation**: https://docs.runpod.io
- **Runpod Support**: https://support.runpod.io
- **AWS CLI Documentation**: https://docs.aws.amazon.com/cli/
- 
## 🔗 Related Resources

- [Runpod Network Volumes Documentation](https://docs.runpod.io/storage/network-volumes)
- [Runpod S3-Compatible API Guide](https://docs.runpod.io/storage/s3-compatible-api)
- [AWS CLI S3 Reference](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html)

---

**Made with ❤️ for automated Runpod workflows**
