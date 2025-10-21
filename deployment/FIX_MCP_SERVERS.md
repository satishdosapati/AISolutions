# Fix MCP Server Connection Issues

## Problem
Your EC2 backend is showing this error:
```
❌ Error in generate_architecture: Strands agent not initialized - MCP servers not connected
```

## Quick Fix (Recommended)

SSH into your EC2 instance and run:

```bash
# Navigate to the application directory
cd /home/ec2-user/aws-agentic-web-ui

# Pull the latest code with the fix
git pull origin main

# Run the automated fix script
sudo bash deployment/fix-mcp-servers.sh
```

The script will:
1. ✅ Install `uv` (Python package installer needed for MCP servers)
2. ✅ Update systemd service configuration
3. ✅ Restart the backend service
4. ✅ Verify the service is working correctly

## What Was Fixed

### Code Changes
1. **Backend Initialization Check** (`backend/strands_agent.py`):
   - Changed from checking `agent.agent is None` to `_clients_initialized` flag
   - This flag is now properly set after MCP clients are initialized

2. **Deployment Script** (`deployment/deploy-amazon-linux3.sh`):
   - Now installs `uv` during initial deployment
   - Creates symlinks for `uv` and `uvx` commands

3. **Systemd Service** (`deployment/systemd/aws-agentic-backend.service`):
   - Updated PATH to include `/home/ec2-user/.cargo/bin` where `uv` is installed
   - Added HOME environment variable

### New Files
- `deployment/fix-mcp-servers.sh` - Automated fix script
- `deployment/TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
- `deployment/FIX_MCP_SERVERS.md` - This file

## Manual Fix (If Automated Script Fails)

If the automated script doesn't work, follow these manual steps:

### Step 1: Install uv
```bash
# As ec2-user
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH
export PATH="$HOME/.cargo/bin:$PATH"
```

### Step 2: Create System Symlinks
```bash
# As root/sudo
sudo ln -sf /home/ec2-user/.cargo/bin/uv /usr/local/bin/uv
sudo ln -sf /home/ec2-user/.cargo/bin/uvx /usr/local/bin/uvx

# Verify
which uvx
uvx --version
```

### Step 3: Update Systemd Service
```bash
# Edit the service file
sudo nano /etc/systemd/system/aws-agentic-backend.service
```

Ensure these lines are present under `[Service]`:
```ini
Environment=PATH=/home/ec2-user/.cargo/bin:/home/ec2-user/aws-agentic-web-ui/backend/venv/bin:/usr/local/bin:/usr/bin:/bin
Environment=HOME=/home/ec2-user
```

### Step 4: Restart Service
```bash
sudo systemctl daemon-reload
sudo systemctl restart aws-agentic-backend
```

## Verification

### 1. Check Service Status
```bash
sudo systemctl status aws-agentic-backend
```

You should see: `Active: active (running)`

### 2. Check Logs
```bash
sudo journalctl -u aws-agentic-backend -n 50
```

Look for these success messages:
```
🔌 Connecting to AWS MCP servers...
🐧 Detected Linux/macOS - using standard MCP server commands
✅ MCP clients initialized successfully
🔒 CloudFormation MCP server configured in READ-ONLY mode
✅ Strands agent initialized successfully with AWS MCP servers
🚀 Ready to generate real AWS architectures!
```

### 3. Test API Endpoint
```bash
curl http://localhost:8000/
```

Should return JSON with `"strands_agents": "✅ Connected"`

### 4. Test from Browser
Open your browser and navigate to your EC2 instance's public IP. Try generating an architecture. The backend should now work without MCP connection errors.

## Still Having Issues?

See `deployment/TROUBLESHOOTING.md` for more detailed troubleshooting steps, including:
- AWS credentials configuration
- Port conflicts
- Firewall issues
- Permission problems
- Network diagnostics

## Prevention for New Deployments

For new EC2 instances, simply run:
```bash
sudo bash deployment/deploy-amazon-linux3.sh
```

The updated deployment script now includes `uv` installation by default, so this issue won't occur on new deployments.

