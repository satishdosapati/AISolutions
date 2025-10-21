#!/bin/bash
# Fix MCP Server Connection Issues
# This script installs uv (Python package installer) and restarts the backend service

set -e

echo "🔧 Fixing MCP server connection issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Install uv (Python package installer required for AWS MCP servers)
echo -e "${BLUE}📦 Installing uv...${NC}"
if ! command -v uv &> /dev/null; then
    # Install uv using the official installer
    curl -LsSf https://astral.sh/uv/install.sh | sh
    
    # Add uv to PATH for ec2-user
    echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> /home/ec2-user/.bashrc
    
    # Add uv to system PATH
    ln -sf /home/ec2-user/.cargo/bin/uv /usr/local/bin/uv
    ln -sf /home/ec2-user/.cargo/bin/uvx /usr/local/bin/uvx
    
    print_status "uv installed successfully"
else
    print_status "uv already installed"
fi

# Verify uv installation
if command -v uvx &> /dev/null; then
    print_status "uvx command is available"
    uvx --version
else
    print_error "uvx command not found after installation"
    echo "Trying alternative installation..."
    
    # Alternative: Install uv as ec2-user
    sudo -u ec2-user bash -c 'curl -LsSf https://astral.sh/uv/install.sh | sh'
    
    # Create symlinks
    if [ -f /home/ec2-user/.cargo/bin/uvx ]; then
        ln -sf /home/ec2-user/.cargo/bin/uv /usr/local/bin/uv
        ln -sf /home/ec2-user/.cargo/bin/uvx /usr/local/bin/uvx
        print_status "Created symlinks for uv/uvx"
    fi
fi

# Update systemd service to include uv in PATH
echo -e "${BLUE}🔧 Updating systemd service configuration...${NC}"
cat > /etc/systemd/system/aws-agentic-backend.service << 'EOF'
[Unit]
Description=AWS Agentic Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/aws-agentic-web-ui/backend
Environment=PATH=/home/ec2-user/.cargo/bin:/home/ec2-user/aws-agentic-web-ui/backend/venv/bin:/usr/local/bin:/usr/bin:/bin
Environment=HOME=/home/ec2-user
ExecStart=/home/ec2-user/aws-agentic-web-ui/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/home/ec2-user/aws-agentic-web-ui/backend/diagrams

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=aws-agentic-backend

[Install]
WantedBy=multi-user.target
EOF

print_status "Systemd service configuration updated"

# Reload systemd and restart service
echo -e "${BLUE}🔄 Restarting backend service...${NC}"
systemctl daemon-reload
systemctl restart aws-agentic-backend

# Wait for service to start
sleep 5

# Check service status
if systemctl is-active --quiet aws-agentic-backend; then
    print_status "Backend service is running"
    
    # Check if backend can connect to MCP servers
    echo -e "${BLUE}🧪 Testing backend health...${NC}"
    if curl -s http://localhost:8000/ | grep -q "live\|initializing"; then
        print_status "Backend API is responding"
    else
        print_error "Backend API is not responding correctly"
    fi
else
    print_error "Backend service failed to start"
    echo "Showing last 50 lines of logs:"
    journalctl -u aws-agentic-backend -n 50 --no-pager
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 MCP server connection fix completed!${NC}"
echo ""
echo -e "${BLUE}📋 Verification:${NC}"
echo "  Check logs: journalctl -u aws-agentic-backend -f"
echo "  Test API: curl http://localhost:8000/"
echo ""
echo -e "${GREEN}✅ The backend should now be able to connect to AWS MCP servers${NC}"

