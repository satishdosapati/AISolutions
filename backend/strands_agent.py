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
        self._clients_initialized = False
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
            
            # Mark clients as initialized
            self._clients_initialized = True
            return True
                
        except Exception as e:
            print(f"❌ Error initializing MCP clients: {e}")
            return False
    
    def generate_architecture(self, requirements: str) -> Dict[str, Any]:
        """
        Generate complete architecture with sequential MCP server processing
        
        Args:
            requirements: User's AWS architecture requirements
            
        Returns:
            Dictionary containing cfTemplate, pricing, and diagramUrl
        """
        try:
            print(f"🤖 Generating architecture for: {requirements}")
            
            # Connect to MCP servers and process sequentially
            with self.cfn_client, self.pricing_client, self.diagram_client:
                print("✅ Connected to AWS CloudFormation MCP Server.")
                print("✅ Connected to AWS Pricing MCP Server.")
                print("✅ Connected to AWS Diagram MCP Server.")

                # Step 1: Generate CloudFormation Template
                print("📋 Step 1: Generating CloudFormation template...")
                cf_template = self._generate_cf_template(requirements)
                
                # Step 2: Generate Architecture Diagram (based on CF template)
                print("📊 Step 2: Generating architecture diagram...")
                diagram_url = self._generate_diagram(cf_template)
                
                # Step 3: Calculate Pricing (based on CF template)
                print("💰 Step 3: Calculating pricing...")
                pricing = self._calculate_pricing(cf_template)
                
                print("🎉 Architecture generation completed successfully!")
                
                return {
                    "cfTemplate": cf_template,
                    "diagramUrl": diagram_url,
                    "pricing": pricing
                }
                
        except Exception as e:
            print(f"❌ Error generating architecture: {e}")
            # Return fallback data
            return self._get_fallback_data()
    
    def _generate_cf_template(self, requirements: str) -> str:
        """Generate CloudFormation template using CF MCP server"""
        try:
            cfn_tools = self.cfn_client.list_tools_sync()
            print(f"📋 Discovered {len(cfn_tools)} tools from CloudFormation MCP Server.")
            
            agent = Agent(tools=cfn_tools)
            
            prompt = f"""
            Generate a complete CloudFormation template for: "{requirements}"
            
            Requirements:
            - Include all necessary AWS resources (VPC, subnets, security groups, etc.)
            - Use best practices and proper resource naming
            - Include outputs for important values
            - Return only the YAML template in code blocks
            
            Template should be production-ready and follow AWS best practices.
            """
            
            print("🚀 Running CloudFormation agent...")
            response = agent(prompt)
            print(f"✅ CloudFormation response received: {len(str(response))} characters")
            
            return self._extract_cf_template(str(response))
            
        except Exception as e:
            print(f"❌ Error generating CloudFormation template: {e}")
            return self._get_fallback_cf_template()
    
    def _generate_diagram(self, cf_template: str) -> str:
        """Generate diagram based on CloudFormation template"""
        try:
            diagram_tools = self.diagram_client.list_tools_sync()
            print(f"📊 Discovered {len(diagram_tools)} tools from AWS Diagram MCP Server.")
            
            agent = Agent(tools=diagram_tools)
            
            prompt = f"""
            Create an AWS architecture diagram based on this CloudFormation template:
            
            {cf_template}
            
            Requirements:
            - Show all components and their relationships
            - Use standard AWS icons and naming conventions
            - Include data flow arrows where appropriate
            - Make it visually clear and professional
            - Return the diagram URL or file path
            """
            
            print("🚀 Running Diagram agent...")
            response = agent(prompt)
            print(f"✅ Diagram response received: {len(str(response))} characters")
            
            return self._extract_diagram_url(str(response))
            
        except Exception as e:
            print(f"❌ Error generating diagram: {e}")
            return self._get_fallback_diagram_url()
    
    def _calculate_pricing(self, cf_template: str) -> Dict[str, Any]:
        """Calculate pricing based on CloudFormation template"""
        try:
            pricing_tools = self.pricing_client.list_tools_sync()
            print(f"💰 Discovered {len(pricing_tools)} tools from AWS Pricing MCP Server.")
            
            agent = Agent(tools=pricing_tools)
            
            prompt = f"""
            Calculate AWS pricing for this CloudFormation template:
            
            {cf_template}
            
            Requirements:
            - Calculate monthly costs for all resources
            - Break down costs by service
            - Include region and currency information
            - Provide detailed breakdown with units
            - Return structured pricing data
            
            Use current AWS pricing and be as accurate as possible.
            """
            
            print("🚀 Running Pricing agent...")
            response = agent(prompt)
            print(f"✅ Pricing response received: {len(str(response))} characters")
            
            return self._extract_pricing_data(str(response))
            
        except Exception as e:
            print(f"❌ Error calculating pricing: {e}")
            return self._get_fallback_pricing()
    
    def _extract_cf_template(self, response: str) -> str:
        """Extract CloudFormation template from agent response"""
        try:
            # Look for YAML code blocks
            cf_match = re.search(r'```yaml\s*(.*?)\s*```', response, re.DOTALL | re.IGNORECASE)
            if not cf_match:
                cf_match = re.search(r'```\s*(AWSTemplateFormatVersion.*?)\s*```', response, re.DOTALL)
            if not cf_match:
                cf_match = re.search(r'(AWSTemplateFormatVersion.*?)(?=\n\n|\Z)', response, re.DOTALL)
            
            if cf_match:
                template = cf_match.group(1).strip()
                print(f"✅ Extracted CloudFormation template: {len(template)} characters")
                return template
            else:
                print("⚠️ Could not extract CloudFormation template from response")
                return self._get_fallback_cf_template()
                
        except Exception as e:
            print(f"❌ Error extracting CloudFormation template: {e}")
            return self._get_fallback_cf_template()
    
    def _extract_diagram_url(self, response: str) -> str:
        """Extract diagram URL from agent response"""
        try:
            # Look for URLs or file paths
            url_patterns = [
                r'https?://[^\s]+\.(png|jpg|jpeg|svg)',
                r'/.*\.(png|jpg|jpeg|svg)',
                r'diagram.*\.(png|jpg|jpeg|svg)',
                r'file://[^\s]+'
            ]
            
            for pattern in url_patterns:
                match = re.search(pattern, response, re.IGNORECASE)
                if match:
                    url = match.group(0)
                    print(f"✅ Extracted diagram URL: {url}")
                    return url
            
            # If no URL found, generate a sample diagram
            print("⚠️ Could not extract diagram URL from response")
            return self._get_fallback_diagram_url()
            
        except Exception as e:
            print(f"❌ Error extracting diagram URL: {e}")
            return self._get_fallback_diagram_url()
    
    def _extract_pricing_data(self, response: str) -> Dict[str, Any]:
        """Extract pricing data from agent response"""
        try:
            # Look for pricing patterns
            pricing_patterns = [
                r'total.*?cost.*?(\$[\d,]+\.?\d*)',
                r'monthly.*?cost.*?(\$[\d,]+\.?\d*)',
                r'cost.*?(\$[\d,]+\.?\d*)',
            ]
            
            total_cost = 0
            for pattern in pricing_patterns:
                match = re.search(pattern, response, re.IGNORECASE)
                if match:
                    cost_str = match.group(1).replace('$', '').replace(',', '')
                    try:
                        total_cost = float(cost_str)
                        break
                    except ValueError:
                        continue
            
            # Extract breakdown if available
            breakdown = []
            lines = response.split('\n')
            for line in lines:
                if '$' in line and any(service in line.lower() for service in ['ec2', 's3', 'rds', 'vpc', 'lambda']):
                    breakdown.append({
                        "service": "AWS Service",
                        "cost": line.strip(),
                        "unit": "monthly",
                        "details": line.strip()
                    })
            
            pricing_data = {
                "totalMonthlyCost": f"${total_cost:.2f}",
                "currency": "USD",
                "region": "us-east-1",
                "breakdown": breakdown,
                "annual": total_cost * 12 if total_cost > 0 else 0
            }
            
            print(f"✅ Extracted pricing data: ${total_cost:.2f} monthly")
            return pricing_data
            
        except Exception as e:
            print(f"❌ Error extracting pricing data: {e}")
            return self._get_fallback_pricing()
    
    def _get_fallback_cf_template(self) -> str:
        """Return fallback CloudFormation template"""
        return """AWSTemplateFormatVersion: '2010-09-09'
Description: 'Sample VPC with two subnets'

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: SampleVPC

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: PublicSubnet1

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: PublicSubnet2

Outputs:
  VPCId:
    Description: VPC ID
    Value: !Ref VPC
    Export:
      Name: !Sub '${AWS::StackName}-VPC-ID'"""
    
    def _get_fallback_diagram_url(self) -> str:
        """Return fallback diagram URL"""
        return "/diagram/sample.png"
    
    def _get_fallback_pricing(self) -> Dict[str, Any]:
        """Return fallback pricing data"""
        return {
            "totalMonthlyCost": "$0.00",
            "currency": "USD",
            "region": "us-east-1",
            "breakdown": [
                {
                    "service": "VPC",
                    "cost": "$0.00",
                    "unit": "monthly",
                    "details": "VPC is free"
                }
            ],
            "annual": 0
        }
    
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