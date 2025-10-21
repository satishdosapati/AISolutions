# AWS Agentic Web UI - Deployment Guide

## 🚀 Production Deployment on Linux EC2

This guide covers deploying the AWS Agentic Web UI to a Linux EC2 instance for optimal compatibility with Strands agents and MCP servers.

### Prerequisites

- Amazon Linux 3 EC2 instance (recommended for AWS integration)
- Node.js 18+ and npm
- Python 3.11+
- AWS CLI configured with appropriate permissions
- Git installed

### 1. Instance Setup

```bash
# Update system
sudo dnf update -y

# Install Node.js 18+ using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Install Python 3.11+ and development tools
sudo dnf install -y python3.11 python3.11-pip python3.11-devel
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y cmake

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Git and other utilities
sudo dnf install -y git curl wget unzip
```

### 2. Application Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd AWS-Agentic-Web-UI

# Setup backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
cd ../frontend
npm install
npm run build

# Create systemd services
sudo nano /etc/systemd/system/aws-agentic-backend.service
sudo nano /etc/systemd/system/aws-agentic-frontend.service
```

### 3. Systemd Services

**Backend Service** (`/etc/systemd/system/aws-agentic-backend.service`):
```ini
[Unit]
Description=AWS Agentic Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/aws-agentic-web-ui/backend
Environment=PATH=/home/ec2-user/aws-agentic-web-ui/backend/venv/bin
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
```

**Frontend Service** (`/etc/systemd/system/aws-agentic-frontend.service`):
```ini
[Unit]
Description=AWS Agentic Frontend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/aws-agentic-web-ui/frontend
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 5173
Restart=always
RestartSec=10

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=aws-agentic-frontend

[Install]
WantedBy=multi-user.target
```

### 4. Start Services

```bash
# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable aws-agentic-backend
sudo systemctl enable aws-agentic-frontend
sudo systemctl start aws-agentic-backend
sudo systemctl start aws-agentic-frontend

# Check status
sudo systemctl status aws-agentic-backend
sudo systemctl status aws-agentic-frontend
```

### 5. Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
sudo dnf install -y nginx

# Configure Nginx
sudo nano /etc/nginx/conf.d/aws-agentic.conf
```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. Security Configuration

```bash
# Configure firewall (Amazon Linux 3 uses firewalld)
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload

# SSL with Let's Encrypt (optional)
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7. MCP Server Setup

**No manual MCP server installation required!** 

The application automatically downloads and runs the public [AWS MCP Servers](https://awslabs.github.io/mcp/) using:
- `uvx` on macOS/Linux 
- `uv` on Windows

These tools are included with the `python-mcp` dependency in `requirements.txt`. The application connects to these essential AWS MCP servers:

#### Core Infrastructure Servers:
- **AWS CloudFormation MCP Server** (`awslabs.cfn-mcp-server@latest`) - Direct CloudFormation resource management
- **AWS API MCP Server** (`awslabs.core-mcp-server@latest`) - Secure programmatic access to AWS services

#### Cost & Operations Servers:
- **AWS Pricing MCP Server** (`awslabs.aws-pricing-mcp-server@latest`) - Pre-deployment cost estimation and optimization

#### Developer Tools:
- **AWS Diagram MCP Server** (`awslabs.aws-diagram-mcp-server@latest`) - Generate architecture diagrams and technical illustrations

These servers provide:
- ✅ **Improved Output Quality**: Reduces hallucinations and provides accurate technical details
- ✅ **Access to Latest Documentation**: Always works with the latest AWS capabilities
- ✅ **Workflow Automation**: Converts common AWS workflows into tools for AI assistants
- ✅ **Specialized Domain Knowledge**: Deep contextual knowledge about AWS services

#### AWS Credentials Setup
The AWS MCP servers require proper AWS authentication. Configure AWS credentials using one of these methods:

```bash
# Option 1: AWS CLI configuration
aws configure
# Enter your Access Key ID, Secret Access Key, region, and output format

# Option 2: IAM Role (recommended for EC2)
# Attach an IAM role to your EC2 instance with appropriate permissions

# Option 3: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

**Required IAM Permissions:**
- CloudFormation: `cloudformation:*`
- Cost/Pricing: `pricing:GetProducts`, `ce:*`
- General AWS API: `sts:GetCallerIdentity`

### 8. Monitoring & Logs

```bash
# View logs
sudo journalctl -u aws-agentic-backend -f
sudo journalctl -u aws-agentic-frontend -f

# Check application health
curl http://localhost:8000/
curl http://localhost:5173/
```

### 9. Environment Variables

Create `.env` file in backend directory (optional):

```bash
# Backend environment
AWS_REGION=us-east-1
AWS_PROFILE=default
# Note: MCP servers are automatically managed by the application
# No manual MCP server URLs needed
```

### 10. Troubleshooting

**Common Issues:**

1. **Strands installation fails**: Ensure build-essential and cmake are installed
2. **MCP servers not responding**: Check if MCP servers are running on expected ports
3. **Frontend build fails**: Ensure Node.js 18+ is installed
4. **Permission errors**: Check file ownership and service user configuration

**Debug Commands:**
```bash
# Check service status
sudo systemctl status aws-agentic-backend
sudo systemctl status aws-agentic-frontend

# View detailed logs
sudo journalctl -u aws-agentic-backend --since "1 hour ago"
sudo journalctl -u aws-agentic-frontend --since "1 hour ago"

# Test API endpoints
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"requirements": "Create a simple web server"}'
```

### 11. Amazon Linux 3 Specific Optimizations

```bash
# Enable EPEL repository for additional packages
sudo dnf install -y epel-release

# Install additional development tools
sudo dnf install -y gcc-c++ make

# Configure system limits for better performance
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Enable automatic security updates
sudo dnf install -y dnf-automatic
sudo systemctl enable --now dnf-automatic.timer
```

### 12. Production Considerations

- **Scaling**: Use Application Load Balancer for multiple instances
- **Database**: Add persistent storage for generated templates
- **Monitoring**: Implement CloudWatch or similar monitoring
- **Backup**: Regular backups of generated content
- **Security**: Implement authentication and authorization
- **Updates**: Set up CI/CD pipeline for automated deployments
- **Amazon Linux 3**: Leverage AWS-optimized packages and configurations

---

## 🐳 Docker Deployment (Alternative)

For containerized deployment on Amazon Linux 3, create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.amazonlinux3
    ports:
      - "8000:8000"
    environment:
      - AWS_REGION=us-east-1
    volumes:
      - ./backend/diagrams:/app/diagrams
    restart: unless-stopped

  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.amazonlinux3
    ports:
      - "5173:5173"
    depends_on:
      - backend
    restart: unless-stopped
```

## 🚀 Amazon Linux 3 EC2 Launch Template

For quick deployment, use this EC2 launch configuration:

**Instance Type**: `t3.medium` or larger (recommended: `t3.large`)
**AMI**: Amazon Linux 3 AMI
**Security Group**: 
- SSH (22) from your IP
- HTTP (80) from anywhere
- HTTPS (443) from anywhere
- Custom TCP (8000) for backend API
- Custom TCP (5173) for frontend

**User Data Script**:
```bash
#!/bin/bash
dnf update -y

# Install basic tools
dnf install -y git curl wget unzip

# Install Python 3.11 and development tools
dnf install -y python3.11 python3.11-pip python3.11-devel
dnf groupinstall -y "Development Tools"
dnf install -y cmake

# Install Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# Install Nginx and firewall
dnf install -y nginx firewalld

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Configure services
systemctl enable nginx firewalld

# Configure AWS CLI region
aws configure set region ${AWS::Region}

# Create application directory
mkdir -p /home/ec2-user/aws-agentic-web-ui
chown ec2-user:ec2-user /home/ec2-user/aws-agentic-web-ui

# Signal CloudFormation that instance is ready
/opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource WebServerInstance --region ${AWS::Region}
```

This completes the Amazon Linux 3 deployment guide for production-ready AWS Agentic Web UI!
