# CloudFormation Infrastructure Deployment Guide

## Overview

This guide walks you through deploying the AWS Agentic Web UI infrastructure using AWS CloudFormation. The template creates a complete VPC environment with an EC2 instance running Amazon Linux 3, configured for internet access to deploy and test the AWS Agentic Web UI application.

## Prerequisites

### 1. AWS CLI Installation and Configuration

**Install AWS CLI v2:**
```bash
# Windows (PowerShell)
winget install Amazon.AWSCLI

# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Configure AWS CLI:**
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your default output format (json)
```

**Verify configuration:**
```bash
aws sts get-caller-identity
```

### 2. SSH Key Pair Setup

**Create a new key pair in AWS:**
```bash
# Generate a new key pair
aws ec2 create-key-pair --key-name aws-agentic-keypair --query 'KeyMaterial' --output text > aws-agentic-keypair.pem

# Set proper permissions (Linux/macOS)
chmod 400 aws-agentic-keypair.pem
```

**Or use an existing key pair:**
```bash
# List existing key pairs
aws ec2 describe-key-pairs --query 'KeyPairs[*].KeyName' --output table
```

### 3. Required IAM Permissions

Ensure your AWS user/role has the following permissions:
- `EC2:*` (for VPC, subnets, security groups, instances)
- `IAM:*` (for instance roles and policies)
- `CloudFormation:*` (for stack operations)

**Minimum required permissions:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "iam:*",
                "cloudformation:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## Deployment Methods

### Method 1: Using AWS CLI (Recommended)

**1. Deploy the CloudFormation stack:**
```bash
aws cloudformation create-stack \
    --stack-name aws-agentic-infrastructure \
    --template-body file://deployment/cloudformation/infrastructure.yaml \
    --parameters ParameterKey=KeyPairName,ParameterValue=aws-agentic-keypair \
                 ParameterKey=InstanceType,ParameterValue=t3.medium \
                 ParameterKey=AllowedSSHCIDR,ParameterValue=0.0.0.0/0 \
    --capabilities CAPABILITY_IAM
```

**2. Monitor stack creation:**
```bash
# Check stack status
aws cloudformation describe-stacks --stack-name aws-agentic-infrastructure --query 'Stacks[0].StackStatus'

# Watch stack events
aws cloudformation describe-stack-events --stack-name aws-agentic-infrastructure --query 'StackEvents[*].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId,ResourceStatusReason]' --output table
```

**3. Get stack outputs:**
```bash
aws cloudformation describe-stacks --stack-name aws-agentic-infrastructure --query 'Stacks[0].Outputs' --output table
```

### Method 2: Using AWS Console

**1. Open AWS CloudFormation Console:**
- Navigate to [AWS CloudFormation Console](https://console.aws.amazon.com/cloudformation/)

**2. Create a new stack:**
- Click "Create stack" → "With new resources"
- Choose "Upload a template file"
- Upload `deployment/cloudformation/infrastructure.yaml`

**3. Configure parameters:**
- Stack name: `aws-agentic-infrastructure`
- KeyPairName: Select your existing key pair
- InstanceType: `t3.medium` (or your preference)
- AllowedSSHCIDR: `0.0.0.0/0` (or restrict to your IP)

**4. Configure stack options:**
- Check "I acknowledge that AWS CloudFormation might create IAM resources"
- Click "Next" → "Submit"

### Method 3: Using the Helper Script

**Run the deployment script:**
```bash
# Make script executable (Linux/macOS)
chmod +x deployment/deploy-stack.sh

# Run the script
./deployment/deploy-stack.sh
```

The script will:
- Validate prerequisites
- Deploy the CloudFormation stack
- Monitor progress
- Display outputs and next steps

## Post-Deployment Setup

### 1. Connect to the EC2 Instance

**Get the instance details:**
```bash
# Get public IP
PUBLIC_IP=$(aws cloudformation describe-stacks --stack-name aws-agentic-infrastructure --query 'Stacks[0].Outputs[?OutputKey==`InstancePublicIP`].OutputValue' --output text)

# Get SSH command
SSH_CMD=$(aws cloudformation describe-stacks --stack-name aws-agentic-infrastructure --query 'Stacks[0].Outputs[?OutputKey==`SSHCommand`].OutputValue' --output text)
echo $SSH_CMD
```

**SSH into the instance:**
```bash
# Replace <path-to-keyfile> with your actual key file path
ssh -i aws-agentic-keypair.pem ec2-user@<PUBLIC_IP>
```

### 2. Deploy the Application

**Clone your repository:**
```bash
# Replace with your actual repository URL
git clone https://github.com/your-username/aws-agentic-web-ui.git
cd aws-agentic-web-ui
```

**Run the deployment script:**
```bash
# Make script executable
chmod +x deployment/deploy-amazon-linux3.sh

# Run deployment (as root or with sudo)
sudo bash deployment/deploy-amazon-linux3.sh
```

### 3. Verify Deployment

**Check service status:**
```bash
# Check if services are running
sudo systemctl status aws-agentic-backend
sudo systemctl status aws-agentic-frontend
sudo systemctl status nginx

# View service logs
sudo journalctl -u aws-agentic-backend -f
sudo journalctl -u aws-agentic-frontend -f
```

**Test application endpoints:**
```bash
# Test backend API
curl http://localhost:8000/

# Test frontend
curl http://localhost:5173/

# Test through Nginx
curl http://localhost/
```

**Access the application:**
- Frontend: `http://<PUBLIC_IP>`
- Backend API: `http://<PUBLIC_IP>/api/`
- Health Check: `http://<PUBLIC_IP>/api/health`

## Troubleshooting

### Common Issues

**1. Stack Creation Fails**

**Check CloudFormation events:**
```bash
aws cloudformation describe-stack-events --stack-name aws-agentic-infrastructure --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`].[LogicalResourceId,ResourceStatusReason]' --output table
```

**Common causes:**
- Invalid key pair name
- Insufficient IAM permissions
- Resource limits exceeded
- Invalid parameter values

**2. Cannot SSH to Instance**

**Check security group:**
```bash
# Verify security group allows SSH
aws ec2 describe-security-groups --group-ids $(aws cloudformation describe-stack-resources --stack-name aws-agentic-infrastructure --logical-resource-id InstanceSecurityGroup --query 'StackResources[0].PhysicalResourceId' --output text)
```

**Check instance status:**
```bash
# Verify instance is running
aws ec2 describe-instances --instance-ids $(aws cloudformation describe-stack-resources --stack-name aws-agentic-infrastructure --logical-resource-id WebServerInstance --query 'StackResources[0].PhysicalResourceId' --output text)
```

**3. Application Services Not Starting**

**Check systemd service logs:**
```bash
sudo journalctl -u aws-agentic-backend --since "10 minutes ago"
sudo journalctl -u aws-agentic-frontend --since "10 minutes ago"
```

**Check file permissions:**
```bash
# Ensure ec2-user owns the application directory
sudo chown -R ec2-user:ec2-user /home/ec2-user/aws-agentic-web-ui
```

**4. Nginx Configuration Issues**

**Test Nginx configuration:**
```bash
sudo nginx -t
```

**Check Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Service Status Checks

**Backend service:**
```bash
# Check if backend is responding
curl -f http://localhost:8000/ || echo "Backend not responding"

# Check process
ps aux | grep uvicorn
```

**Frontend service:**
```bash
# Check if frontend is responding
curl -f http://localhost:5173/ || echo "Frontend not responding"

# Check process
ps aux | grep npm
```

**Nginx service:**
```bash
# Check Nginx status
sudo systemctl status nginx

# Check if Nginx is listening on port 80
sudo netstat -tlnp | grep :80
```

### Log Locations

- **Application logs:** `journalctl -u aws-agentic-backend -f`
- **Nginx logs:** `/var/log/nginx/error.log` and `/var/log/nginx/access.log`
- **System logs:** `/var/log/messages` or `journalctl`
- **CloudFormation logs:** AWS Console → CloudFormation → Stack → Events

## Security Considerations

### SSH Key Management
- Store your private key securely
- Use `chmod 400` to restrict key file permissions
- Consider using AWS Systems Manager Session Manager for enhanced security

### Security Group Best Practices
- Restrict SSH access to your IP address instead of `0.0.0.0/0`
- Use bastion host for production environments
- Regularly review and update security group rules

### IAM Permissions
- Follow principle of least privilege
- Use IAM roles instead of hardcoded credentials
- Regularly rotate access keys

### Cost Monitoring
- Set up billing alerts in AWS
- Use AWS Cost Explorer to monitor spending
- Consider using Spot instances for development

## Cleanup

### Delete the CloudFormation Stack

**Using AWS CLI:**
```bash
aws cloudformation delete-stack --stack-name aws-agentic-infrastructure
```

**Using AWS Console:**
1. Navigate to CloudFormation console
2. Select the stack
3. Click "Delete"
4. Confirm deletion

**Monitor deletion:**
```bash
aws cloudformation describe-stacks --stack-name aws-agentic-infrastructure --query 'Stacks[0].StackStatus'
```

### Manual Cleanup (if needed)

If stack deletion fails, manually delete resources:
```bash
# Get resource IDs from stack
aws cloudformation describe-stack-resources --stack-name aws-agentic-infrastructure

# Delete resources manually (in order)
# 1. Terminate EC2 instance
# 2. Delete security groups
# 3. Delete subnets
# 4. Detach and delete internet gateway
# 5. Delete route tables
# 6. Delete VPC
```

## Next Steps

After successful deployment:

1. **Configure MCP Servers:** Set up AWS MCP servers for full functionality
2. **SSL Setup:** Configure Let's Encrypt for HTTPS
3. **Domain Configuration:** Point your domain to the instance
4. **Monitoring:** Set up CloudWatch monitoring and alerts
5. **Backup:** Configure automated backups for generated content
6. **Scaling:** Consider Application Load Balancer for multiple instances

## Support

For issues specific to:
- **CloudFormation:** Check AWS CloudFormation documentation
- **EC2:** Check AWS EC2 documentation
- **Application:** Check the main project README.md
- **Deployment Script:** Check `deployment/deploy-amazon-linux3.sh` comments

---

**Note:** This infrastructure is designed for development and testing. For production use, consider additional security measures, monitoring, and high availability configurations.
