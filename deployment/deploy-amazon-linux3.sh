#!/bin/bash
# AWS Agentic Web UI - Amazon Linux 3 Deployment Script
# Run this script as root or with sudo privileges

set -e  # Exit on any error

echo "🚀 Starting AWS Agentic Web UI deployment on Amazon Linux 3..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ec2-user/aws-agentic-web-ui"
REPO_URL="${REPO_URL:-https://github.com/satishdosapati/AISolutions.git}"  # Update this with your actual repository URL
AWS_REGION="${AWS_REGION:-us-east-1}"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  App Directory: $APP_DIR"
echo "  Repository: $REPO_URL"
echo "  AWS Region: $AWS_REGION"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
dnf update -y
print_status "System updated"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
echo -e "${BLUE}ℹ️  Note: Basic dependencies should already be installed via CloudFormation UserData${NC}"
dnf install -y python3.11 python3.11-pip python3.11-devel git wget unzip
dnf groupinstall -y "Development Tools"
dnf install -y cmake nginx firewalld

# Install Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

print_status "Dependencies installed"

# Install AWS CLI v2
if ! command -v aws &> /dev/null; then
    echo -e "${BLUE}📦 Installing AWS CLI v2...${NC}"
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    ./aws/install
    rm -rf aws awscliv2.zip
    print_status "AWS CLI v2 installed"
else
    print_status "AWS CLI already installed"
fi

# Configure AWS CLI
if [ ! -f /home/ec2-user/.aws/config ]; then
    echo -e "${BLUE}🔧 Configuring AWS CLI...${NC}"
    sudo -u ec2-user aws configure set region $AWS_REGION
    print_warning "Please run 'aws configure' to set up your AWS credentials"
else
    print_status "AWS CLI already configured"
fi

# Clone repository
if [ ! -d "$APP_DIR" ]; then
    echo -e "${BLUE}📥 Cloning repository...${NC}"
    sudo -u ec2-user git clone $REPO_URL $APP_DIR
    print_status "Repository cloned"
else
    echo -e "${BLUE}📥 Updating repository...${NC}"
    cd $APP_DIR
    sudo -u ec2-user git pull
    print_status "Repository updated"
fi

# Setup backend
echo -e "${BLUE}🐍 Setting up Python backend...${NC}"
cd $APP_DIR/backend

# Create virtual environment
sudo -u ec2-user python3.11 -m venv venv
sudo -u ec2-user ./venv/bin/pip install --upgrade pip
sudo -u ec2-user ./venv/bin/pip install -r requirements.txt

print_status "Backend dependencies installed"

# Setup frontend
echo -e "${BLUE}⚛️  Setting up React frontend...${NC}"
cd $APP_DIR/frontend
sudo -u ec2-user npm install
sudo -u ec2-user npm run build

print_status "Frontend built"

# Install systemd services
echo -e "${BLUE}🔧 Installing systemd services...${NC}"
cp $APP_DIR/deployment/systemd/*.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable aws-agentic-backend aws-agentic-frontend

print_status "Systemd services installed and enabled"

# Configure Nginx
echo -e "${BLUE}🌐 Configuring Nginx...${NC}"
cp $APP_DIR/deployment/nginx/aws-agentic.conf /etc/nginx/conf.d/
nginx -t
systemctl enable nginx

print_status "Nginx configured"

# Configure firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=8000/tcp
firewall-cmd --permanent --add-port=5173/tcp
firewall-cmd --reload

print_status "Firewall configured"

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
systemctl start aws-agentic-backend
systemctl start aws-agentic-frontend
systemctl start nginx

# Wait a moment for services to start
sleep 5

# Check service status
echo -e "${BLUE}📊 Checking service status...${NC}"
if systemctl is-active --quiet aws-agentic-backend; then
    print_status "Backend service is running"
else
    print_error "Backend service failed to start"
    systemctl status aws-agentic-backend --no-pager
fi

if systemctl is-active --quiet aws-agentic-frontend; then
    print_status "Frontend service is running"
else
    print_error "Frontend service failed to start"
    systemctl status aws-agentic-frontend --no-pager
fi

if systemctl is-active --quiet nginx; then
    print_status "Nginx service is running"
else
    print_error "Nginx service failed to start"
    systemctl status nginx --no-pager
fi

# Test endpoints
echo -e "${BLUE}🧪 Testing endpoints...${NC}"
if curl -s http://localhost:8000/ > /dev/null; then
    print_status "Backend API is responding"
else
    print_error "Backend API is not responding"
fi

if curl -s http://localhost:5173/ > /dev/null; then
    print_status "Frontend is responding"
else
    print_error "Frontend is not responding"
fi

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Access Information:${NC}"
echo "  Frontend: http://$PUBLIC_IP"
echo "  Backend API: http://$PUBLIC_IP/api/"
echo "  Health Check: http://$PUBLIC_IP/api/health"
echo ""
echo -e "${BLUE}📊 Service Management:${NC}"
echo "  Check status: systemctl status aws-agentic-backend aws-agentic-frontend nginx"
echo "  View logs: journalctl -u aws-agentic-backend -f"
echo "  Restart services: systemctl restart aws-agentic-backend aws-agentic-frontend"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "  1. Configure AWS credentials: sudo -u ec2-user aws configure"
echo "  2. Set up MCP servers for full functionality"
echo "  3. Configure SSL certificate with Let's Encrypt"
echo "  4. Update security groups to allow HTTP/HTTPS traffic"
echo ""
echo -e "${GREEN}🚀 AWS Agentic Web UI is ready to use!${NC}"
