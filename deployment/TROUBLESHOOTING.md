# Troubleshooting Guide

## MCP Server Connection Issues

### Symptom
Backend logs show:
```
❌ Error in generate_architecture: Strands agent not initialized - MCP servers not connected
```

### Root Cause
The backend requires `uv` (Astral's Python package installer) to run AWS MCP servers via `uvx` commands. If `uv` is not installed on the EC2 instance, the MCP servers cannot be initialized.

### Quick Fix
SSH into your EC2 instance and run:

```bash
# Download and run the fix script
cd /home/ec2-user/aws-agentic-web-ui
sudo bash deployment/fix-mcp-servers.sh
```

This script will:
1. Install `uv` and `uvx` 
2. Update the systemd service configuration to include `uv` in PATH
3. Restart the backend service
4. Verify the service is working

### Manual Fix
If you prefer to fix manually:

1. **Install uv**:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   export PATH="$HOME/.cargo/bin:$PATH"
   ```

2. **Create symlinks** (as root):
   ```bash
   sudo ln -sf /home/ec2-user/.cargo/bin/uv /usr/local/bin/uv
   sudo ln -sf /home/ec2-user/.cargo/bin/uvx /usr/local/bin/uvx
   ```

3. **Update systemd service** (as root):
   ```bash
   sudo nano /etc/systemd/system/aws-agentic-backend.service
   ```
   
   Update the `Environment=PATH` line to include `/home/ec2-user/.cargo/bin`:
   ```
   Environment=PATH=/home/ec2-user/.cargo/bin:/home/ec2-user/aws-agentic-web-ui/backend/venv/bin:/usr/local/bin:/usr/bin:/bin
   Environment=HOME=/home/ec2-user
   ```

4. **Restart the service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart aws-agentic-backend
   ```

5. **Verify**:
   ```bash
   # Check service status
   sudo systemctl status aws-agentic-backend
   
   # Check logs
   sudo journalctl -u aws-agentic-backend -f
   
   # Test API
   curl http://localhost:8000/
   ```

### Verification
After applying the fix, you should see in the logs:
```
✅ MCP clients initialized successfully
🔒 CloudFormation MCP server configured in READ-ONLY mode
💡 Clients will be connected during agent execution
✅ Strands agent initialized successfully with AWS MCP servers
🚀 Ready to generate real AWS architectures!
```

## Other Common Issues

### AWS Credentials Not Configured
**Symptom**: MCP servers fail with AWS authentication errors

**Fix**: Configure AWS credentials for ec2-user:
```bash
sudo -u ec2-user aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

### Port Already in Use
**Symptom**: Backend fails to start with "Address already in use" error

**Fix**: Find and kill the process using port 8000:
```bash
sudo lsof -i :8000
sudo kill -9 <PID>
sudo systemctl restart aws-agentic-backend
```

### Permission Denied - Diagrams Directory
**Symptom**: Backend fails to save diagrams

**Fix**: Ensure the diagrams directory exists and has correct permissions:
```bash
cd /home/ec2-user/aws-agentic-web-ui/backend
mkdir -p diagrams
sudo chown -R ec2-user:ec2-user diagrams
sudo chmod 755 diagrams
```

### Frontend Cannot Reach Backend
**Symptom**: Frontend shows connection errors

**Fix**: 
1. Check if backend is running: `sudo systemctl status aws-agentic-backend`
2. Check firewall: `sudo firewall-cmd --list-all`
3. Verify security group allows inbound traffic on port 8000
4. Check nginx configuration: `sudo nginx -t`

## Getting Help

### Check Logs
```bash
# Backend logs
sudo journalctl -u aws-agentic-backend -f

# Frontend logs
sudo journalctl -u aws-agentic-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Service Status
```bash
# Check all services
sudo systemctl status aws-agentic-backend aws-agentic-frontend nginx

# Restart all services
sudo systemctl restart aws-agentic-backend aws-agentic-frontend nginx
```

### Network Diagnostics
```bash
# Test backend locally
curl http://localhost:8000/

# Test from outside
curl http://<PUBLIC_IP>:8000/

# Check listening ports
sudo netstat -tlnp | grep -E '8000|5173|80|443'
```

## Prevention

For new deployments, use the updated deployment script:
```bash
sudo bash deployment/deploy-amazon-linux3.sh
```

This script now includes `uv` installation by default.

