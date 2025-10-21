#!/bin/bash
# AWS Agentic Web UI - CloudFormation Stack Deployment Script
# This script deploys the infrastructure using AWS CloudFormation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="aws-agentic-infrastructure"
TEMPLATE_FILE="deployment/cloudformation/infrastructure.yaml"
DEFAULT_INSTANCE_TYPE="t3.medium"
DEFAULT_SSH_CIDR="0.0.0.0/0"

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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate prerequisites
validate_prerequisites() {
    print_info "Validating prerequisites..."
    
    # Check AWS CLI
    if ! command_exists aws; then
        print_error "AWS CLI is not installed. Please install AWS CLI v2."
        exit 1
    fi
    
    # Check AWS CLI configuration
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check template file exists
    if [ ! -f "$TEMPLATE_FILE" ]; then
        print_error "CloudFormation template not found: $TEMPLATE_FILE"
        exit 1
    fi
    
    # Validate template syntax
    if ! aws cloudformation validate-template --template-body file://"$TEMPLATE_FILE" >/dev/null 2>&1; then
        print_error "CloudFormation template validation failed"
        exit 1
    fi
    
    print_status "Prerequisites validated"
}

# Function to get user input with defaults
get_user_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    echo -n -e "${BLUE}$prompt${NC}"
    if [ -n "$default" ]; then
        echo -n " [$default]"
    fi
    echo -n ": "
    
    read -r input
    if [ -z "$input" ] && [ -n "$default" ]; then
        input="$default"
    fi
    
    eval "$var_name='$input'"
}

# Function to list available key pairs
list_key_pairs() {
    print_info "Available EC2 Key Pairs:"
    aws ec2 describe-key-pairs --query 'KeyPairs[*].[KeyName,KeyFingerprint]' --output table
}

# Function to check if stack exists
stack_exists() {
    aws cloudformation describe-stacks --stack-name "$STACK_NAME" >/dev/null 2>&1
}

# Function to get stack status
get_stack_status() {
    aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND"
}

# Function to wait for stack operation
wait_for_stack() {
    local operation="$1"
    print_info "Waiting for stack $operation to complete..."
    
    while true; do
        local status=$(get_stack_status)
        case "$status" in
            "CREATE_COMPLETE"|"UPDATE_COMPLETE"|"DELETE_COMPLETE")
                print_status "Stack $operation completed successfully"
                break
                ;;
            "CREATE_FAILED"|"UPDATE_FAILED"|"DELETE_FAILED"|"ROLLBACK_COMPLETE"|"ROLLBACK_FAILED")
                print_error "Stack $operation failed with status: $status"
                show_stack_events
                exit 1
                ;;
            "NOT_FOUND")
                if [ "$operation" = "deletion" ]; then
                    print_status "Stack deletion completed"
                    break
                else
                    print_error "Stack not found"
                    exit 1
                fi
                ;;
            *)
                echo -n "."
                sleep 10
                ;;
        esac
    done
}

# Function to show stack events
show_stack_events() {
    print_info "Recent stack events:"
    aws cloudformation describe-stack-events \
        --stack-name "$STACK_NAME" \
        --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[Timestamp,LogicalResourceId,ResourceStatus,ResourceStatusReason]' \
        --output table
}

# Function to display stack outputs
show_stack_outputs() {
    print_info "Stack outputs:"
    aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue,Description]' \
        --output table
}

# Function to deploy stack
deploy_stack() {
    local key_pair="$1"
    local instance_type="$2"
    local ssh_cidr="$3"
    
    print_info "Deploying CloudFormation stack: $STACK_NAME"
    
    aws cloudformation create-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://"$TEMPLATE_FILE" \
        --parameters \
            ParameterKey=KeyPairName,ParameterValue="$key_pair" \
            ParameterKey=InstanceType,ParameterValue="$instance_type" \
            ParameterKey=AllowedSSHCIDR,ParameterValue="$ssh_cidr" \
        --capabilities CAPABILITY_IAM \
        --tags \
            Key=Project,Value=AWS-Agentic-Web-UI \
            Key=Environment,Value=Development \
            Key=ManagedBy,Value=CloudFormation
    
    wait_for_stack "creation"
    show_stack_outputs
}

# Function to update stack
update_stack() {
    local key_pair="$1"
    local instance_type="$2"
    local ssh_cidr="$3"
    
    print_info "Updating CloudFormation stack: $STACK_NAME"
    
    aws cloudformation update-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://"$TEMPLATE_FILE" \
        --parameters \
            ParameterKey=KeyPairName,ParameterValue="$key_pair" \
            ParameterKey=InstanceType,ParameterValue="$instance_type" \
            ParameterKey=AllowedSSHCIDR,ParameterValue="$ssh_cidr" \
        --capabilities CAPABILITY_IAM
    
    wait_for_stack "update"
    show_stack_outputs
}

# Function to delete stack
delete_stack() {
    print_warning "This will delete the entire infrastructure stack: $STACK_NAME"
    echo -n "Are you sure you want to continue? (yes/no): "
    read -r confirmation
    
    if [ "$confirmation" = "yes" ]; then
        print_info "Deleting CloudFormation stack: $STACK_NAME"
        aws cloudformation delete-stack --stack-name "$STACK_NAME"
        wait_for_stack "deletion"
        print_status "Stack deleted successfully"
    else
        print_info "Stack deletion cancelled"
    fi
}

# Function to show help
show_help() {
    echo "AWS Agentic Web UI - CloudFormation Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy     Deploy or update the infrastructure stack (default)"
    echo "  delete     Delete the infrastructure stack"
    echo "  status     Show current stack status"
    echo "  outputs    Show stack outputs"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                # Deploy stack with interactive prompts"
    echo "  $0 deploy         # Deploy stack with interactive prompts"
    echo "  $0 delete         # Delete stack with confirmation"
    echo "  $0 status         # Show stack status"
    echo ""
}

# Function to show stack status
show_status() {
    if stack_exists; then
        local status=$(get_stack_status)
        print_info "Stack Status: $status"
        
        if [ "$status" = "CREATE_COMPLETE" ] || [ "$status" = "UPDATE_COMPLETE" ]; then
            show_stack_outputs
        fi
    else
        print_warning "Stack does not exist: $STACK_NAME"
    fi
}

# Main function
main() {
    local command="${1:-deploy}"
    
    case "$command" in
        "deploy"|"")
            validate_prerequisites
            
            if stack_exists; then
                local status=$(get_stack_status)
                if [ "$status" = "CREATE_COMPLETE" ] || [ "$status" = "UPDATE_COMPLETE" ]; then
                    print_info "Stack already exists. Updating..."
                    list_key_pairs
                    echo ""
                    get_user_input "Enter EC2 Key Pair Name" "" "KEY_PAIR"
                    get_user_input "Enter Instance Type" "$DEFAULT_INSTANCE_TYPE" "INSTANCE_TYPE"
                    get_user_input "Enter SSH CIDR Block" "$DEFAULT_SSH_CIDR" "SSH_CIDR"
                    update_stack "$KEY_PAIR" "$INSTANCE_TYPE" "$SSH_CIDR"
                else
                    print_error "Stack exists but is not in a stable state: $status"
                    exit 1
                fi
            else
                print_info "Deploying new stack..."
                list_key_pairs
                echo ""
                get_user_input "Enter EC2 Key Pair Name" "" "KEY_PAIR"
                get_user_input "Enter Instance Type" "$DEFAULT_INSTANCE_TYPE" "INSTANCE_TYPE"
                get_user_input "Enter SSH CIDR Block" "$DEFAULT_SSH_CIDR" "SSH_CIDR"
                deploy_stack "$KEY_PAIR" "$INSTANCE_TYPE" "$SSH_CIDR"
            fi
            
            echo ""
            print_status "Deployment completed successfully!"
            echo ""
            print_info "Next Steps:"
            echo "1. SSH into the instance using the provided SSH command"
            echo "2. Clone your repository: git clone <your-repo-url>"
            echo "3. Run deployment script: sudo bash deployment/deploy-amazon-linux3.sh"
            echo "4. Access the application using the provided URLs"
            ;;
        
        "delete")
            if stack_exists; then
                delete_stack
            else
                print_warning "Stack does not exist: $STACK_NAME"
            fi
            ;;
        
        "status")
            show_status
            ;;
        
        "outputs")
            if stack_exists; then
                show_stack_outputs
            else
                print_warning "Stack does not exist: $STACK_NAME"
            fi
            ;;
        
        "help"|"-h"|"--help")
            show_help
            ;;
        
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
