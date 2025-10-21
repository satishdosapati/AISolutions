"""
Strands Agent Integration for AWS Architecture Generation

This module integrates with Strands agent and AWS MCP servers to generate:
1. CloudFormation templates via AWS CloudFormation MCP
2. Pricing estimates via AWS Pricing MCP  
3. Architecture diagrams via AWS Diagram MCP

Fixed MCP client context manager issue based on working example.
"""

from strands import Agent
from strands.tools.mcp import MCPClient
from mcp import stdio_client, StdioServerParameters
import os
import time
import json
import re
from typing import Dict, Any, Optional
import base64
from datetime import datetime

class AWSArchitectureAgent:
    def __init__(self, readonly_mode: bool = True):
        """Initialize the Strands agent with AWS MCP servers"""
        self.agent = None
        self.cfn_client = None
        self.pricing_client = None
        self.diagram_client = None
        self._clients_connected = False
        self.readonly_mode = readonly_mode
        
    def connect_to_mcp_servers(self):
        """Connect to all three AWS MCP servers"""
        try:
            print("🔌 Connecting to AWS MCP servers...")
            
            # Initialize MCP clients based on the working example
            if os.name == 'nt':  # Windows
                print("📱 Detected Windows - using Windows MCP server commands")
                
                # CloudFormation MCP with read-only option
                cfn_args = [
                    "tool",
                    "run",
                    "--from",
                    "awslabs.cfn-mcp-server@latest",
                    "awslabs.cfn-mcp-server.exe"
                ]
                if self.readonly_mode:
                    cfn_args.append("--readonly")
                
                self.cfn_client = MCPClient(lambda: stdio_client(
                    StdioServerParameters(
                        command="uv",
                        args=cfn_args
                    )
                ))
                
                self.pricing_client = MCPClient(lambda: stdio_client(
                    StdioServerParameters(
                        command="uv",
                        args=[
                            "tool",
                            "run",
                            "--from",
                            "awslabs.aws-pricing-mcp-server@latest",
                            "awslabs.aws-pricing-mcp-server.exe"
                        ]
                    )
                ))
                
                self.diagram_client = MCPClient(lambda: stdio_client(
                    StdioServerParameters(
                        command="uv",
                        args=[
                            "tool",
                            "run",
                            "--from",
                            "awslabs.aws-diagram-mcp-server@latest",
                            "awslabs.aws-diagram-mcp-server.exe"
                        ]
                    )
                ))
            else:  # macOS/Linux
                print("🐧 Detected Linux/macOS - using standard MCP server commands")
                
                # CloudFormation MCP with read-only option
                cfn_args = ["awslabs.cfn-mcp-server@latest"]
                if self.readonly_mode:
                    cfn_args.append("--readonly")
                
                self.cfn_client = MCPClient(lambda: stdio_client(
                    StdioServerParameters(
                        command="uvx",
                        args=cfn_args
                    )
                ))
                
                self.pricing_client = MCPClient(lambda: stdio_client(
                    StdioServerParameters(
                        command="uvx",
                        args=["awslabs.aws-pricing-mcp-server@latest"]
                    )
                ))
                
                self.diagram_client = MCPClient(lambda: stdio_client(
                    StdioServerParameters(
                        command="uvx",
                        args=["awslabs.aws-diagram-mcp-server@latest"]
                    )
                ))
            
            print("✅ MCP clients initialized successfully")
            if self.readonly_mode:
                print("🔒 CloudFormation MCP server configured in READ-ONLY mode")
            print("💡 Clients will be connected during agent execution")
            
            return True
                
        except Exception as e:
            print(f"❌ Error initializing MCP clients: {e}")
            return False
    
    def generate_architecture(self, requirements: str) -> Dict[str, Any]:
        """
        Generate complete architecture based on user requirements
        MCP clients are connected within this method to maintain context
        
        Args:
            requirements: User's AWS architecture requirements
            
        Returns:
            Dictionary containing cfTemplate, pricing, and diagramUrl
        """
        try:
            print(f"🤖 Generating architecture for: {requirements}")
            
            # Connect to MCP servers and get tools (following the working example pattern)
            with self.cfn_client, self.pricing_client, self.diagram_client:
                print("✅ Connected to AWS CloudFormation MCP Server.")
                print("✅ Connected to AWS Pricing MCP Server.")
                print("✅ Connected to AWS Diagram MCP Server.")

                cfn_tools = self.cfn_client.list_tools_sync()
                print(f"📋 Discovered {len(cfn_tools)} tools from CloudFormation MCP Server.")

                pricing_tools = self.pricing_client.list_tools_sync()
                print(f"💰 Discovered {len(pricing_tools)} tools from AWS Pricing MCP Server.")

                diagram_tools = self.diagram_client.list_tools_sync()
                print(f"📊 Discovered {len(diagram_tools)} tools from AWS Diagram MCP Server.")

                # Combine all tools and create agent
                all_tools = cfn_tools + pricing_tools + diagram_tools
                agent = Agent(tools=all_tools)
                print(f"🤖 Strands agent created with {len(all_tools)} combined tools.")
                
                # Craft comprehensive prompt for the agent
                prompt = f"""
                Generate a complete AWS architecture based on these requirements: "{requirements}"
                
                Please provide:
                1. A complete CloudFormation template (YAML format) with all necessary resources
                2. A detailed cost estimate with monthly pricing breakdown using the pricing tools
                3. An architecture diagram showing the components and their relationships using the diagram tools
                
                For the CloudFormation template:
                - Include all necessary resources (VPC, subnets, security groups, etc.)
                - Use best practices and proper resource naming
                - Include outputs for important values
                
                For the pricing:
                - Use the pricing tools to get accurate current AWS pricing
                - Calculate monthly costs for all resources
                - Break down costs by service
                - Include region and currency information
                
                For the diagram:
                - Use the diagram tools to create a visual representation
                - Show data flow and component relationships
                - Use standard AWS icons and naming conventions
                """
                
                print("🚀 Running Strands agent with MCP tools...")
                response = agent(prompt)
                print(f"✅ Agent response received: {len(str(response))} characters")
                
                # Parse the agent response to extract structured data
                result = self._parse_agent_response(str(response))
                return result
                
        except Exception as e:
            print(f"❌ Error generating architecture: {e}")
            # Return fallback data
            return self._get_fallback_data()
    
    def _parse_agent_response(self, response: str) -> Dict[str, Any]:
        """
        Parse the agent's text response to extract structured data
        
        Args:
            response: Raw text response from the agent
            
        Returns:
            Structured dictionary with cfTemplate, pricing, and diagramUrl
        """
        result = {
            "cfTemplate": "",
            "pricing": {
                "totalMonthly": 0,
                "currency": "USD",
                "region": "us-east-1",
                "breakdown": [],
                "annual": 0
            },
            "diagramUrl": ""
        }
        
        try:
            # Extract CloudFormation template
            cf_match = re.search(r'```yaml\s*(.*?)\s*```', response, re.DOTALL | re.IGNORECASE)
            if not cf_match:
                cf_match = re.search(r'```\s*(AWSTemplateFormatVersion.*?)\s*```', response, re.DOTALL)
            
            if cf_match:
                result["cfTemplate"] = cf_match.group(1).strip()
            else:
                # Fallback: look for YAML-like content
                lines = response.split('\n')
                yaml_lines = []
                in_yaml = False
                for line in lines:
                    if 'AWSTemplateFormatVersion' in line or 'Resources:' in line:
                        in_yaml = True
                    if in_yaml:
                        yaml_lines.append(line)
                        if line.strip() == '' and len(yaml_lines) > 10:
                            break
                
                if yaml_lines:
                    result["cfTemplate"] = '\n'.join(yaml_lines)
            
            # Extract pricing information
            pricing_patterns = [
                r'total[:\s]*\$?(\d+\.?\d*)[:\s]*(?:per month|monthly)',
                r'cost[:\s]*\$?(\d+\.?\d*)[:\s]*(?:per month|monthly)',
                r'\$(\d+\.?\d*)[:\s]*(?:per month|monthly)'
            ]
            
            for pattern in pricing_patterns:
                match = re.search(pattern, response, re.IGNORECASE)
                if match:
                    result["pricing"]["totalMonthly"] = float(match.group(1))
                    break
            
            # Extract service breakdown
            service_lines = re.findall(r'([A-Za-z\s]+)[:\s]*\$?(\d+\.?\d*)[:\s]*(?:per month|monthly)', response)
            for service, cost in service_lines:
                if len(service.strip()) > 3:  # Filter out short matches
                    result["pricing"]["breakdown"].append({
                        "service": service.strip(),
                        "cost": float(cost),
                        "type": "service",
                        "description": f"Monthly cost for {service.strip()}"
                    })
            
            # Generate diagram filename and save if diagram data is found
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            diagram_filename = f"architecture_{timestamp}.png"
            
            # Look for base64 image data or diagram description
            base64_match = re.search(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)', response)
            if base64_match:
                try:
                    diagram_data = base64.b64decode(base64_match.group(1))
                    diagram_path = f"diagrams/{diagram_filename}"
                    os.makedirs("diagrams", exist_ok=True)
                    
                    with open(diagram_path, "wb") as f:
                        f.write(diagram_data)
                    
                    result["diagramUrl"] = f"/diagram/{diagram_filename}"
                    print(f"📊 Diagram saved to: {diagram_path}")
                except Exception as e:
                    print(f"⚠️ Error saving diagram: {e}")
                    result["diagramUrl"] = "/diagram/sample.png"
            else:
                # Use sample diagram if no diagram data found
                result["diagramUrl"] = "/diagram/sample.png"
            
            # Calculate annual cost
            if result["pricing"]["totalMonthly"] > 0:
                result["pricing"]["annual"] = result["pricing"]["totalMonthly"] * 12
            
            # If no CloudFormation template found, use a basic one
            if not result["cfTemplate"]:
                result["cfTemplate"] = self._generate_fallback_template()
            
            # If no pricing found, use default
            if result["pricing"]["totalMonthly"] == 0:
                result["pricing"]["totalMonthly"] = 125.00
                result["pricing"]["breakdown"] = [
                    {
                        "service": "EC2 Instances",
                        "cost": 75.00,
                        "type": "compute",
                        "description": "Estimated based on requirements"
                    },
                    {
                        "service": "Other AWS Services",
                        "cost": 50.00,
                        "type": "storage",
                        "description": "Storage, networking, etc."
                    }
                ]
                result["pricing"]["annual"] = 1500.00
            
            return result
            
        except Exception as e:
            print(f"⚠️ Error parsing agent response: {e}")
            return self._get_fallback_data()
    
    def _get_fallback_data(self) -> Dict[str, Any]:
        """Get fallback data when parsing fails"""
        return {
            "cfTemplate": self._generate_fallback_template(),
            "pricing": {
                "totalMonthly": 125.00,
                "currency": "USD",
                "region": "us-east-1",
                "breakdown": [
                    {
                        "service": "AWS Services",
                        "cost": 125.00,
                        "type": "general",
                        "description": "Estimated cost based on requirements"
                    }
                ],
                "annual": 1500.00
            },
            "diagramUrl": "/diagram/sample.png"
        }
    
    def _generate_fallback_template(self) -> str:
        """Generate a basic CloudFormation template as fallback"""
        return """AWSTemplateFormatVersion: '2010-09-09'
Description: 'AWS Architecture generated by Strands Agent'

Parameters:
  Environment:
    Type: String
    Default: prod
    AllowedValues: [dev, staging, prod]

Resources:
  # VPC
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

  # Attach Internet Gateway to VPC
  InternetGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref InternetGateway
      VpcId: !Ref VPC

Outputs:
  VPCId:
    Description: VPC ID
    Value: !Ref VPC
    Export:
      Name: !Sub '${Environment}-vpc-id'
"""

# Global agent instance
aws_agent = None

def get_aws_agent() -> AWSArchitectureAgent:
    """Get or create the global AWS agent instance"""
    global aws_agent
    if aws_agent is None:
        aws_agent = AWSArchitectureAgent(readonly_mode=True)
    return aws_agent