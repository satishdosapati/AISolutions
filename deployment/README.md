# Deployment Directory

This directory contains all the deployment-related files for the AWS Agentic Web UI infrastructure and application.

## Files Overview

### Infrastructure as Code
- **`cloudformation/infrastructure.yaml`** - CloudFormation template that creates the complete VPC infrastructure with EC2 instance
- **`deploy-stack.sh`** - Helper script to deploy the CloudFormation stack with validation and monitoring

### Application Deployment
- **`deploy-amazon-linux3.sh`** - Automated script to deploy the application on Amazon Linux 3 EC2 instances
- **`nginx/aws-agentic.conf`** - Nginx configuration for reverse proxy setup
- **`systemd/`** - Systemd service files for running the application as services

### Documentation
- **`CLOUDFORMATION_DEPLOYMENT.md`** - Comprehensive guide for deploying infrastructure using CloudFormation
- **`DEPLOYMENT.md`** - General deployment guide for the application

## Quick Start

### 1. Deploy Infrastructure
```bash
# Using the helper script (Linux/macOS)
./deploy-stack.sh

# Or manually with AWS CLI
aws cloudformation create-stack \
    --stack-name aws-agentic-infrastructure \
    --template-body file://cloudformation/infrastructure.yaml \
    --parameters ParameterKey=KeyPairName,ParameterValue=your-key-pair \
    --capabilities CAPABILITY_IAM
```

### 2. Deploy Application
```bash
# SSH into the instance
ssh -i your-key.pem ec2-user@<instance-ip>

# Clone repository and run deployment script
git clone <your-repo-url>
cd aws-agentic-web-ui
sudo bash deployment/deploy-amazon-linux3.sh
```

## Directory Structure

```
deployment/
├── cloudformation/
│   └── infrastructure.yaml      # CloudFormation template
├── nginx/
│   └── aws-agentic.conf         # Nginx configuration
├── systemd/
│   ├── aws-agentic-backend.service  # Backend service
│   └── aws-agentic-frontend.service # Frontend service
├── deploy-stack.sh              # Infrastructure deployment script
├── deploy-amazon-linux3.sh      # Application deployment script
├── CLOUDFORMATION_DEPLOYMENT.md # Infrastructure deployment guide
├── DEPLOYMENT.md                # Application deployment guide
└── README.md                    # This file
```

## Prerequisites

- AWS CLI installed and configured
- SSH key pair created in AWS
- Appropriate IAM permissions for CloudFormation and EC2

## Security Notes

- The default configuration allows SSH access from anywhere (0.0.0.0/0)
- For production, restrict SSH access to your IP address
- Consider using AWS Systems Manager Session Manager for enhanced security
- The infrastructure includes basic security groups and IAM roles

## Cost Considerations

- Uses t3.medium instance by default (adjustable in CloudFormation template)
- Includes 30GB EBS volume with encryption
- All resources can be easily deleted via CloudFormation stack deletion

## Support

For deployment issues, check:
1. The troubleshooting section in `CLOUDFORMATION_DEPLOYMENT.md`
2. CloudFormation stack events in AWS Console
3. Application logs using `journalctl -u service-name -f`
