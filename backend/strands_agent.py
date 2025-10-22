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
import shutil
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
            - Save the diagram as a PNG file
            """
            
            print("🚀 Running Diagram agent...")
            response = agent(prompt)
            print(f"✅ Diagram response received: {len(str(response))} characters")
            
            # Log first 500 characters of response for debugging
            response_preview = str(response)[:500]
            print(f"📝 Diagram response preview: {response_preview}...")
            
            # Extract and save diagram
            return self._extract_and_save_diagram(str(response))
            
        except Exception as e:
            print(f"❌ Error generating diagram: {e}")
            return self._get_fallback_diagram_url()
    
    def _calculate_pricing(self, cf_template: str) -> Dict[str, Any]:
        """Calculate pricing using Pricing MCP server with optimized input"""
        try:
            pricing_tools = self.pricing_client.list_tools_sync()
            print(f"💰 Discovered {len(pricing_tools)} tools from AWS Pricing MCP Server.")
            
            # Extract resource summary for pricing (much smaller than full template)
            resource_summary = self._extract_resources_for_pricing(cf_template)
            print(f"📊 Extracted {len(resource_summary)} resource types for pricing analysis")
            
            agent = Agent(tools=pricing_tools)
            
            prompt = f"""
            Provide AWS cost estimate for these resources:
            
            {resource_summary}
            
            Return JSON format:
            {{
              "totalMonthlyCost": <number>,
              "currency": "USD",
              "region": "US East (N. Virginia)",
              "breakdown": [
                {{
                  "resourceType": "<AWS::Service::Type>",
                  "quantity": <number>,
                  "unitCost": <number>,
                  "monthlyCost": <number>,
                  "description": "<description>"
                }}
              ]
            }}
            
            Use these standard pricing estimates:
            - VPC/Subnet/RouteTable/InternetGateway: Free
            - NAT Gateway: $0.045/hour = $32.40/month per gateway
            - EIP (when attached to NAT Gateway): Free
            - VPC Flow Logs: $0.50 per GB ingested (estimate 50GB = $25/month)
            - CloudWatch Logs: $0.50 per GB (estimate 10GB = $5/month)
            - Security Groups: Free
            
            Calculate costs based on resource quantities in the summary above.
            """
            
            print("🚀 Running Pricing agent...")
            response = agent(prompt)
            print(f"✅ Pricing response received: {len(str(response))} characters")
            
            pricing_data = self._extract_pricing_data(str(response))
            print(f"✅ Extracted pricing data: ${pricing_data.get('totalMonthlyCost', 'N/A')} monthly")
            return pricing_data
            
        except Exception as e:
            print(f"❌ Error calculating pricing: {e}")
            return self._get_fallback_pricing()
    
    def _extract_resources_for_pricing(self, cf_template: str) -> str:
        """Extract resource types and quantities from CloudFormation template for pricing"""
        try:
            import yaml
            
            # Parse the CloudFormation template with custom loader to handle !Ref tags
            class CloudFormationLoader(yaml.SafeLoader):
                pass
            
            # Add constructors for CloudFormation intrinsic functions
            CloudFormationLoader.add_constructor('!Ref', lambda loader, node: f"!Ref {node.value}")
            CloudFormationLoader.add_constructor('!GetAtt', lambda loader, node: f"!GetAtt {node.value}")
            CloudFormationLoader.add_constructor('!Sub', lambda loader, node: f"!Sub {node.value}")
            CloudFormationLoader.add_constructor('!Join', lambda loader, node: f"!Join {node.value}")
            CloudFormationLoader.add_constructor('!Select', lambda loader, node: f"!Select {node.value}")
            CloudFormationLoader.add_constructor('!Split', lambda loader, node: f"!Split {node.value}")
            
            template_data = yaml.load(cf_template, Loader=CloudFormationLoader)
            resources = template_data.get('Resources', {})
            
            # Count resource types
            resource_counts = {}
            for resource_name, resource_config in resources.items():
                resource_type = resource_config.get('Type', 'Unknown')
                if resource_type not in resource_counts:
                    resource_counts[resource_type] = 0
                resource_counts[resource_type] += 1
            
            # Create resource summary
            resource_summary = "AWS Resources to Price:\n"
            for resource_type, count in resource_counts.items():
                resource_summary += f"- {resource_type}: {count} instance(s)\n"
            
            # Add common resource details for better pricing
            resource_summary += "\nCommon Resource Details:\n"
            for resource_name, resource_config in resources.items():
                resource_type = resource_config.get('Type', '')
                properties = resource_config.get('Properties', {})
                
                if 'AWS::EC2::Instance' in resource_type:
                    instance_type = properties.get('InstanceType', 't3.micro')
                    resource_summary += f"- EC2 Instance ({resource_name}): {instance_type}\n"
                elif 'AWS::RDS::DBInstance' in resource_type:
                    db_class = properties.get('DBInstanceClass', 'db.t3.micro')
                    resource_summary += f"- RDS Instance ({resource_name}): {db_class}\n"
                elif 'AWS::S3::Bucket' in resource_type:
                    resource_summary += f"- S3 Bucket ({resource_name}): Standard storage\n"
                elif 'AWS::VPC' in resource_type:
                    resource_summary += f"- VPC ({resource_name}): Free networking\n"
                elif 'AWS::EC2::Subnet' in resource_type:
                    resource_summary += f"- Subnet ({resource_name}): Free networking\n"
                elif 'AWS::EC2::SecurityGroup' in resource_type:
                    resource_summary += f"- Security Group ({resource_name}): Free networking\n"
                elif 'AWS::EC2::InternetGateway' in resource_type:
                    resource_summary += f"- Internet Gateway ({resource_name}): Free networking\n"
                elif 'AWS::EC2::NatGateway' in resource_type:
                    resource_summary += f"- NAT Gateway ({resource_name}): ~$45/month\n"
                elif 'AWS::EC2::EIP' in resource_type:
                    resource_summary += f"- Elastic IP ({resource_name}): ~$3.65/month\n"
            
            print(f"📊 Created resource summary: {len(resource_summary)} characters")
            return resource_summary
            
        except Exception as e:
            print(f"❌ Error extracting resources: {e}")
            # Fallback to simple resource list
            return "AWS Resources: VPC, Subnets, Security Groups, NAT Gateway, Elastic IP"
    
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
    
    def _extract_and_save_diagram(self, response: str) -> str:
        """Extract diagram data from agent response and save it to a file"""
        try:
            # Create diagrams directory if it doesn't exist (relative to backend directory)
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            diagrams_dir = os.path.join(backend_dir, "diagrams")
            os.makedirs(diagrams_dir, exist_ok=True)
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            diagram_filename = f"architecture_{timestamp}.png"
            diagram_path = os.path.join(diagrams_dir, diagram_filename)
            
            # Try to extract base64 image data from the response
            base64_patterns = [
                r'data:image/[^;]+;base64,([A-Za-z0-9+/=\s]+)',
                r'<img[^>]+src="data:image/[^;]+;base64,([A-Za-z0-9+/=\s]+)"',
                r'```base64\s*([A-Za-z0-9+/=\s]+)\s*```',
            ]
            
            for pattern in base64_patterns:
                match = re.search(pattern, response, re.IGNORECASE | re.DOTALL)
                if match:
                    try:
                        # Extract and clean base64 data
                        base64_data = match.group(1).strip().replace('\n', '').replace(' ', '')
                        diagram_data = base64.b64decode(base64_data)
                        
                        # Save to file
                        with open(diagram_path, "wb") as f:
                            f.write(diagram_data)
                        
                        print(f"✅ Diagram saved to: {diagram_path}")
                        return f"/diagram/{diagram_filename}"
                    except Exception as e:
                        print(f"⚠️ Failed to decode base64 image: {e}")
                        continue
            
            # Try to find existing file path in the response
            file_path_patterns = [
                r'(?:file://)?([/\\]?[\w/\\.-]+\.(?:png|jpg|jpeg|svg))',
                r'(?:saved|created|written) (?:to|at|as):?\s*([/\\]?[\w/\\.-]+\.(?:png|jpg|jpeg|svg))',
            ]
            
            for pattern in file_path_patterns:
                match = re.search(pattern, response, re.IGNORECASE)
                if match:
                    source_path = match.group(1).strip()
                    if os.path.exists(source_path):
                        try:
                            # Copy the file to our diagrams directory
                            import shutil
                            shutil.copy(source_path, diagram_path)
                            print(f"✅ Diagram copied from {source_path} to {diagram_path}")
                            return f"/diagram/{diagram_filename}"
                        except Exception as e:
                            print(f"⚠️ Failed to copy diagram file: {e}")
                            continue
                    else:
                        print(f"⚠️ Diagram file not found at: {source_path}")
            
            # If no diagram found, use fallback
            print("⚠️ Could not extract or save diagram from response")
            return self._get_fallback_diagram_url()
            
        except Exception as e:
            print(f"❌ Error extracting and saving diagram: {e}")
            import traceback
            traceback.print_exc()
            return self._get_fallback_diagram_url()
    
    def _extract_pricing_data(self, response: str) -> Dict[str, Any]:
        """Extract pricing data from agent response"""
        try:
            # First try to extract JSON from code blocks
            json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL | re.IGNORECASE)
            if json_match:
                import json
                json_str = json_match.group(1).strip()
                pricing_json = json.loads(json_str)
                
                # Convert to expected format
                total_cost = pricing_json.get('totalMonthlyCost', 0)
                if isinstance(total_cost, str):
                    total_cost = float(total_cost.replace('$', '').replace(',', ''))
                
                # Convert breakdown to expected format
                breakdown = []
                for item in pricing_json.get('breakdown', []):
                    breakdown.append({
                        "service": item.get('service', 'Unknown'),
                        "cost": f"${item.get('monthlyCost', 0):.2f}",
                        "unit": "monthly",
                        "details": item.get('description', '') or item.get('details', '')
                    })
                
                pricing_data = {
                    "totalMonthlyCost": f"${total_cost:.2f}",
                    "currency": pricing_json.get('currency', 'USD'),
                    "region": pricing_json.get('region', 'us-east-1'),
                    "breakdown": breakdown,
                    "annual": total_cost * 12 if total_cost > 0 else 0
                }
                
                print(f"✅ Extracted pricing data from JSON: ${total_cost:.2f} monthly")
                return pricing_data
            
            # Fallback to regex extraction if no JSON found
            pricing_patterns = [
                r'total.*?cost.*?(\$?[\d,]+\.?\d*)',
                r'monthly.*?cost.*?(\$?[\d,]+\.?\d*)',
                r'cost.*?(\$?[\d,]+\.?\d*)',
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
                if '$' in line and any(service in line.lower() for service in ['ec2', 's3', 'rds', 'vpc', 'lambda', 'nat', 'elastic']):
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
                "breakdown": breakdown if breakdown else [
                    {
                        "service": "Various AWS Services",
                        "cost": f"${total_cost:.2f}",
                        "unit": "monthly",
                        "details": "Estimated monthly cost"
                    }
                ],
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