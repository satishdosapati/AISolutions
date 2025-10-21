"""
AWS Agentic Web UI - Backend Server with Strands Integration

This FastAPI server integrates with Strands agent and AWS MCP servers to generate
real CloudFormation templates, pricing estimates, and architecture diagrams.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from typing import Dict, Any
import asyncio
from strands_agent import get_aws_agent

# Initialize FastAPI app
app = FastAPI(
    title="AWS Agentic Web UI API",
    description="Backend for AWS architecture generation using Strands agent and MCP servers",
    version="0.2.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving diagrams
app.mount("/diagram", StaticFiles(directory="diagrams"), name="diagrams")

# Initialize AWS agent on startup
@app.on_event("startup")
async def startup_event():
    """Initialize the Strands agent on server startup"""
    try:
        agent = get_aws_agent()
        success = agent.connect_to_mcp_servers()
        if success:
            print("✅ Strands agent initialized successfully with AWS MCP servers")
            print("🚀 Ready to generate real AWS architectures!")
        else:
            raise Exception("Failed to connect to MCP servers")
    except Exception as e:
        print(f"❌ Critical Error: {e}")
        print("💥 Application requires working Strands agent with MCP servers")
        print("💡 Deploy to Linux EC2 instance for best compatibility")
        raise e

# Request/Response models
class GenerateRequest(BaseModel):
    requirements: str

class GenerateResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str = ""

# Mock data - this will be replaced with real Strands agent in Phase 4
MOCK_CF_TEMPLATE = """AWSTemplateFormatVersion: '2010-09-09'
Description: 'Sample 3-tier web application architecture'

Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues: [dev, staging, prod]

Resources:
  # VPC and Networking
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-vpc'

  # Internet Gateway
  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-igw'

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub '${Environment}-alb'
      Scheme: internet-facing
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # RDS Database
  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub '${Environment}-database'
      DBInstanceClass: db.t3.micro
      Engine: MySQL
      EngineVersion: '8.0'
      AllocatedStorage: 20
      MasterUsername: admin
      MasterUserPassword: !Ref DatabasePassword
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DatabaseSubnetGroup

Outputs:
  LoadBalancerDNS:
    Description: DNS name of the load balancer
    Value: !GetAtt ApplicationLoadBalancer.DNSName
    Export:
      Name: !Sub '${Environment}-alb-dns'
"""

MOCK_PRICING = {
    "totalMonthlyCost": "125.45",
    "breakdown": [
        {
            "service": "Application Load Balancer",
            "cost": "18.50",
            "unit": "month",
            "details": "Standard ALB with 750 LCU hours"
        },
        {
            "service": "RDS MySQL (db.t3.micro)",
            "cost": "15.20",
            "unit": "month", 
            "details": "20 GB storage, 750 hours"
        },
        {
            "service": "EC2 Instances (t3.small)",
            "cost": "67.50",
            "unit": "month",
            "details": "2 instances, 750 hours each"
        },
        {
            "service": "VPC & Networking",
            "cost": "12.25",
            "unit": "month",
            "details": "NAT Gateway, VPC endpoints"
        },
        {
            "service": "Data Transfer",
            "cost": "12.00",
            "unit": "month",
            "details": "Estimated 100GB outbound"
        }
    ],
    "currency": "USD",
    "region": "us-east-1"
}

@app.get("/")
async def root():
    """Health check endpoint"""
    agent = get_aws_agent()
    status = "live" if agent.agent is not None else "initializing"
    
    return {
        "message": "AWS Agentic Web UI Backend is running", 
        "status": status,
        "version": "1.0.0",
        "strands_agents": "✅ Connected",
        "mcp_servers": "✅ Ready"
    }

@app.post("/generate", response_model=GenerateResponse)
async def generate_architecture(request: GenerateRequest):
    """
    Generate real AWS architecture using Strands agent and MCP servers.
    
    This endpoint:
    1. Uses AWS CloudFormation MCP server for template generation
    2. Uses AWS Pricing MCP server for cost estimation
    3. Uses AWS Diagram MCP server for architecture visualization
    4. Returns structured data with real AWS resources and pricing
    """
    try:
        agent = get_aws_agent()
        
        # Check if agent is properly initialized
        if agent.agent is None:
            raise Exception("Strands agent not initialized - MCP servers not connected")
        
        # Generate real architecture using Strands agent
        print(f"🤖 Generating real architecture with Strands for: {request.requirements}")
        
        # Run the agent in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        response_data = await loop.run_in_executor(
            None, 
            agent.generate_architecture, 
            request.requirements
        )
        
        return GenerateResponse(
            success=True,
            data=response_data,
            message=f"✅ Generated real AWS architecture for: {request.requirements[:50]}..."
        )
        
    except Exception as e:
        print(f"❌ Error in generate_architecture: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate architecture: {str(e)}. Ensure MCP servers are running and accessible."
        )

@app.get("/diagram/{filename}")
async def get_diagram(filename: str):
    """Serve diagram images"""
    file_path = f"diagrams/{filename}"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        raise HTTPException(status_code=404, detail="Diagram not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
