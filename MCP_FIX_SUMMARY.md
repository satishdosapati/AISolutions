# MCP Server Connection Issue - Root Cause & Fix

## Summary

Your backend on EC2 was failing to connect to AWS MCP servers with the error:
```
❌ Error in generate_architecture: Strands agent not initialized - MCP servers not connected
```

## Root Cause

**Missing `uv` Package Installer**

The backend uses AWS MCP servers (CloudFormation, Pricing, Diagram) that are installed and run via `uvx` commands. The `uvx` tool is part of the `uv` Python package installer from Astral, but the deployment script didn't install it.

### Technical Details

1. **Code Issue**: The initialization check in `server.py` was incorrectly checking `agent.agent is None`, but this attribute was never set during startup. The agent was only created temporarily inside the `generate_architecture()` method.

2. **Missing Dependency**: The `uvx` command was not available on the EC2 instance because `uv` was never installed during deployment.

3. **Environment PATH**: Even if `uv` was manually installed, the systemd service didn't have the correct PATH to find it.

## What Was Fixed

### 1. Code Fixes
- ✅ Changed initialization check from `agent.agent is None` to `_clients_initialized` flag
- ✅ Added proper flag setting when MCP clients are successfully initialized

### 2. Deployment Improvements
- ✅ Updated `deploy-amazon-linux3.sh` to install `uv` during deployment
- ✅ Updated systemd service to include `~/.cargo/bin` in PATH
- ✅ Created automated fix script for existing deployments

### 3. Documentation
- ✅ Created `TROUBLESHOOTING.md` with comprehensive debugging guide
- ✅ Created `FIX_MCP_SERVERS.md` with step-by-step fix instructions
- ✅ Updated product tracker with issue details

## Files Changed

```
backend/
├── strands_agent.py          # Fixed initialization logic
└── server.py                 # Fixed initialization check

deployment/
├── deploy-amazon-linux3.sh              # Added uv installation
├── fix-mcp-servers.sh                   # NEW: Automated fix script
├── FIX_MCP_SERVERS.md                   # NEW: Fix instructions
├── TROUBLESHOOTING.md                   # NEW: Troubleshooting guide
└── systemd/
    └── aws-agentic-backend.service      # Updated PATH

docs/
└── product_tracker.md                   # Updated with fix details
```

## How to Apply the Fix

### On Your EC2 Instance

SSH into your EC2 instance and run:

```bash
cd /home/ec2-user/aws-agentic-web-ui
git pull origin main
sudo bash deployment/fix-mcp-servers.sh
```

The script will:
1. Install `uv` and `uvx`
2. Update systemd service configuration
3. Restart the backend
4. Verify everything is working

### Verification

After running the fix, check the logs:
```bash
sudo journalctl -u aws-agentic-backend -n 50
```

You should see:
```
✅ MCP clients initialized successfully
✅ Strands agent initialized successfully with AWS MCP servers
🚀 Ready to generate real AWS architectures!
```

Test the API:
```bash
curl http://localhost:8000/
```

Should return: `"strands_agents": "✅ Connected"`

## For New Deployments

Future deployments will automatically include `uv` installation. Just run:
```bash
sudo bash deployment/deploy-amazon-linux3.sh
```

## Next Steps

1. **Immediate**: Apply the fix to your EC2 instance using the steps above
2. **Verify**: Test architecture generation from the frontend
3. **Monitor**: Check logs to ensure MCP servers are connecting properly
4. **Optional**: Review `TROUBLESHOOTING.md` for other common issues

## Questions?

- Detailed fix instructions: `deployment/FIX_MCP_SERVERS.md`
- Troubleshooting guide: `deployment/TROUBLESHOOTING.md`
- Check logs: `sudo journalctl -u aws-agentic-backend -f`

---

**Status**: ✅ Fixed and ready to deploy

**Priority**: High (blocking production functionality)

**Effort**: 5 minutes to apply fix

**Impact**: Backend will properly initialize and connect to AWS MCP servers

