# Nebula - AI-Powered AWS Solution Builder

A modern web interface for generating AWS CloudFormation templates, pricing estimates, and architecture diagrams using AI agents and MCP servers.

## Product Development Philosophy

This project follows a **minimal-first, iterative approach**:

1. **Mock First:** Start with sample data to validate UX flow
2. **Track Everything:** Log all changes and prompt evolution
3. **Iterate Gradually:** Add complexity only after core functionality works
4. **Stay Organized:** Clear folder structure and consistent naming

## Architecture

```
/backend          - FastAPI server with Strands agent integration
├── server.py     - Main FastAPI application
├── strands_agent.py - AWS MCP server integration
├── requirements.txt - Python dependencies
└── diagrams/     - Generated architecture diagrams

/frontend         - Vite + React + TypeScript + Tailwind
├── src/
│   ├── components/    - UI components (AppLayout, InputPanel, etc.)
│   ├── pages/         - Route pages (ObservabilityPage)
│   ├── hooks/         - Custom React hooks
│   ├── services/      - API services and utilities
│   └── router.tsx     - React Router configuration
├── package.json       - Node.js dependencies
└── vite.config.ts     - Vite build configuration

/deployment       - Infrastructure and deployment scripts
├── cloudformation/    - AWS CloudFormation templates
├── systemd/          - System service configurations
├── nginx/            - Reverse proxy configuration
└── deploy-*.sh       - Automated deployment scripts

/docs             - Documentation and product tracking
/prompts          - Prompt evolution tracking
```

## Prerequisites

### Node.js Installation (Windows)

1. **Download Node.js:**
   - Visit [nodejs.org](https://nodejs.org/)
   - Download the LTS version (recommended for most users)
   - Choose Windows Installer (.msi) for your system (x64 for 64-bit)

2. **Install Node.js:**
   - Run the downloaded .msi file
   - Follow the installation wizard (accept defaults)
   - Restart your terminal/command prompt after installation

3. **Verify Installation:**
   ```bash
   node --version
   npm --version
   ```
   Both commands should return version numbers.

### Python Requirements
- Python 3.9+ 
- pip package manager

## Quick Start

### Current Status: Minimal Working System (Phases 1-3 Complete)

**Backend Setup:**
```bash
# 1. Install Python dependencies
cd backend
pip install -r requirements.txt

# 2. Start the mock backend server
uvicorn server:app --reload
# Backend will be available at http://localhost:8000
```

**Frontend Setup:**
```powershell
# 1. Fix PowerShell execution policy (run as Administrator if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. Install Node.js dependencies (requires Node.js 18+)
cd frontend
npm install

# 3. Start the development server
npm run dev
# Frontend will be available at http://localhost:5173
```

**Test the System:**
1. Open http://localhost:5173 in your browser
2. Enter architecture requirements (e.g., "Create a 3-tier web app")
3. Click "Generate Architecture" 
4. View results in the three tabs: CloudFormation, Pricing, Diagram

**Note:** Now includes real Strands agent integration with AWS MCP servers!

### Phase 4: Real Integration ✅
```bash
# Install new dependencies for Strands integration
cd backend
pip install -r requirements.txt

# Backend now connects to AWS MCP servers:
# - awslabs.cfn-mcp-server (CloudFormation templates)
# - awslabs.aws-pricing-mcp-server (Cost estimates)  
# - awslabs.aws-diagram-mcp-server (Architecture diagrams)
```

### Phase 5: Enhanced UI & Polish ✅
```bash
# Frontend now includes:
# - Modular component architecture with TypeScript
# - React Router for multi-page navigation
# - Syntax highlighting for CloudFormation templates
# - Enhanced pricing display with cost breakdown
# - Professional diagram viewing with controls
# - ZIP download for complete results package
# - Real-time observability dashboard
# - Event streaming and activity feeds
# - AWS Console-inspired design with dark theme
# - Responsive design for all screen sizes
```

## Evolution Roadmap

1. **Phase 1:** Foundation & tracking setup ✅
2. **Phase 2:** Mock backend with sample data ✅
3. **Phase 3:** Minimal frontend UI ✅
4. **Phase 4:** Real Strands agent integration ✅
5. **Phase 5:** Enhanced UI & advanced features ✅
6. **Phase 6:** Production deployment & scaling (Next)

## Features

### 🏗️ **Architecture Generation**
- **Real AWS CloudFormation templates** generated using Strands agents
- **Accurate cost estimation** with AWS Pricing API integration
- **Professional architecture diagrams** with AWS Diagram MCP server
- **Downloadable results** in ZIP format with all artifacts

### 📊 **Observability Dashboard**
- **Real-time event streaming** for generation activities
- **Activity feed** with detailed event tracking
- **Filter controls** for event types and time ranges
- **Event cards** with rich metadata and status indicators

### 🎨 **Modern UI/UX**
- **AWS Console-inspired design** with dark theme
- **Responsive layout** for desktop and mobile
- **Syntax highlighting** for CloudFormation templates
- **Interactive components** with smooth animations
- **Multi-page navigation** with React Router

### 🚀 **Production Ready**
- **Automated deployment** with CloudFormation
- **Systemd services** with security hardening
- **Nginx reverse proxy** with SSL support
- **Health monitoring** and logging
- **Firewall configuration** and security groups

## API Endpoints

- `POST /generate` - Generate architecture (requirements → CF template + pricing + diagram)
- `GET /diagram/{filename}` - Serve generated architecture diagrams
- `GET /` - Health check endpoint

## Development Workflow

1. **Track Changes:** Log every modification in `/docs/product_tracker.md`
2. **Track Prompts:** Record prompt evolution in `/prompts/prompt_tracker.md`
3. **Iterate:** Build minimal → test → enhance → repeat
4. **Document:** Keep README updated with current state

## Contributing

Follow the minimal-first philosophy:
- Get basic functionality working first
- Add complexity only when needed
- Document all changes in tracking files
- Keep code simple and well-commented
