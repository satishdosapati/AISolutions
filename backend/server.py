"""
AWS Agentic Web UI - Backend Server with Strands Integration

This FastAPI server integrates with Strands agent and AWS MCP servers to generate
real CloudFormation templates, pricing estimates, and architecture diagrams.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import os
import subprocess
import json
import uuid
from typing import Dict, Any, List, Optional
import asyncio
from datetime import datetime
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
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000",  # Vite default ports
        "http://44.223.105.170:5173",  # EC2 frontend
        "http://44.223.105.170",  # EC2 frontend (no port)
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving diagrams
app.mount("/diagram", StaticFiles(directory="diagrams"), name="diagrams")

# Task storage for async generation
active_tasks: Dict[str, Dict[str, Any]] = {}

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

# Async task generation endpoints
class TaskStartResponse(BaseModel):
    task_id: str
    message: str

class TaskStatus(BaseModel):
    task_id: str
    status: str
    progress: int
    message: str
    started_at: str
    completed_at: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

def run_generation_task(task_id: str, requirements: str):
    """Background task to run architecture generation"""
    try:
        # Update status to generating CloudFormation
        active_tasks[task_id]["status"] = "generating_cf"
        active_tasks[task_id]["progress"] = 10
        active_tasks[task_id]["message"] = "🔧 Generating CloudFormation template..."
        
        agent = get_aws_agent()
        
        # Check if MCP clients are properly initialized
        if not agent._clients_initialized:
            raise Exception("Strands agent not initialized - MCP servers not connected")
        
        # Update progress
        active_tasks[task_id]["progress"] = 20
        active_tasks[task_id]["message"] = "🏗️ Creating AWS architecture..."
        
        # Generate architecture
        print(f"🤖 [Task {task_id[:8]}] Generating architecture for: {requirements[:50]}...")
        response_data = agent.generate_architecture(requirements)
        
        # Mark as completed
        active_tasks[task_id]["status"] = "completed"
        active_tasks[task_id]["progress"] = 100
        active_tasks[task_id]["message"] = "✅ Architecture generation complete!"
        active_tasks[task_id]["data"] = response_data
        active_tasks[task_id]["completed_at"] = datetime.now().isoformat()
        
        print(f"✅ [Task {task_id[:8]}] Architecture generation completed successfully!")
        
    except Exception as e:
        print(f"❌ [Task {task_id[:8]}] Error: {e}")
        active_tasks[task_id]["status"] = "failed"
        active_tasks[task_id]["progress"] = 0
        active_tasks[task_id]["message"] = "❌ Generation failed"
        active_tasks[task_id]["error"] = str(e)
        active_tasks[task_id]["completed_at"] = datetime.now().isoformat()

@app.post("/generate/start", response_model=TaskStartResponse)
async def start_generation(request: GenerateRequest, background_tasks: BackgroundTasks):
    """
    Start architecture generation as a background task.
    Returns immediately with a task ID for polling.
    """
    task_id = str(uuid.uuid4())
    
    # Initialize task
    active_tasks[task_id] = {
        "status": "started",
        "progress": 0,
        "message": "🚀 Starting architecture generation...",
        "started_at": datetime.now().isoformat(),
        "completed_at": None,
        "data": None,
        "error": None
    }
    
    # Run generation in background
    background_tasks.add_task(run_generation_task, task_id, request.requirements)
    
    print(f"🎬 [Task {task_id[:8]}] Started generation task")
    
    return TaskStartResponse(
        task_id=task_id,
        message="Architecture generation started. Use the task_id to check status."
    )

@app.get("/generate/status/{task_id}", response_model=TaskStatus)
async def get_generation_status(task_id: str):
    """
    Check the status of an architecture generation task.
    Poll this endpoint to get progress updates.
    """
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = active_tasks[task_id]
    
    return TaskStatus(
        task_id=task_id,
        status=task["status"],
        progress=task["progress"],
        message=task["message"],
        started_at=task["started_at"],
        completed_at=task.get("completed_at"),
        data=task.get("data"),
        error=task.get("error")
    )

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
        
        # Check if MCP clients are properly initialized
        if not agent._clients_initialized:
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

# Observability endpoints
@app.get("/events")
async def get_events(limit: int = 100):
    """Get recent backend logs as events for observability dashboard"""
    try:
        # Get recent logs from journalctl
        result = subprocess.run([
            'journalctl', '-u', 'aws-agentic-backend', 
            '-n', str(limit), '--no-pager', '--output=json'
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail="Failed to fetch logs")
        
        events = []
        for line in result.stdout.strip().split('\n'):
            if line.strip():
                try:
                    log_entry = json.loads(line)
                    # Convert journalctl log to event format
                    event = {
                        "id": f"log_{log_entry.get('__REALTIME_TIMESTAMP', 'unknown')}",
                        "type": _categorize_log_message(log_entry.get('MESSAGE', '')),
                        "timestamp": log_entry.get('__REALTIME_TIMESTAMP', ''),
                        "message": log_entry.get('MESSAGE', ''),
                        "metadata": {
                            "priority": log_entry.get('PRIORITY', ''),
                            "unit": log_entry.get('_SYSTEMD_UNIT', ''),
                            "hostname": log_entry.get('_HOSTNAME', '')
                        }
                    }
                    events.append(event)
                except json.JSONDecodeError:
                    continue
        
        return {"events": events, "total": len(events)}
        
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Log fetch timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching logs: {str(e)}")

@app.get("/events/stream")
async def stream_events():
    """Stream backend logs in real-time using Server-Sent Events"""
    async def event_generator():
        try:
            # Start journalctl follow mode
            process = await asyncio.create_subprocess_exec(
                'journalctl', '-u', 'aws-agentic-backend', '-f', '--no-pager', '--output=json',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            while True:
                line = await process.stdout.readline()
                if not line:
                    break
                    
                try:
                    log_entry = json.loads(line.decode().strip())
                    event = {
                        "id": f"stream_{log_entry.get('__REALTIME_TIMESTAMP', 'unknown')}",
                        "type": _categorize_log_message(log_entry.get('MESSAGE', '')),
                        "timestamp": log_entry.get('__REALTIME_TIMESTAMP', ''),
                        "message": log_entry.get('MESSAGE', ''),
                        "metadata": {
                            "priority": log_entry.get('PRIORITY', ''),
                            "unit": log_entry.get('_SYSTEMD_UNIT', ''),
                            "hostname": log_entry.get('_HOSTNAME', '')
                        }
                    }
                    
                    yield f"data: {json.dumps(event)}\n\n"
                    
                except json.JSONDecodeError:
                    continue
                    
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

def _categorize_log_message(message: str) -> str:
    """Categorize log messages into event types"""
    message_lower = message.lower()
    
    if any(keyword in message_lower for keyword in ['error', 'failed', 'exception']):
        return 'error'
    elif any(keyword in message_lower for keyword in ['tool #', 'mcp', 'agent']):
        return 'agent_to_mcp'
    elif any(keyword in message_lower for keyword in ['response', 'returned', 'provided']):
        return 'mcp_response'
    elif any(keyword in message_lower for keyword in ['processing', 'generating', 'calculating', 'extracting']):
        return 'processing'
    elif any(keyword in message_lower for keyword in ['completed', 'success', 'generated', 'created']):
        return 'output'
    else:
        return 'processing'  # Default category

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
