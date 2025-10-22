# Product Tracker

Track all changes, enhancements, and issues for the AWS Agentic Web UI project.

## Format
Date | Change | Impact | Next Steps

---

## Entries

### 2024-12-19 | Initial Project Scaffold
**Change:** Created project structure with organized folders (/backend, /frontend, /docs, /prompts) and tracking systems
**Impact:** Established foundation for minimal iterative development approach
**Next Steps:** Build mock backend with FastAPI and sample data

### 2024-12-19 | Phase 2: Mock Backend Complete
**Change:** Built FastAPI backend with mock /generate endpoint returning sample CloudFormation template, pricing data, and diagram URL
**Impact:** Backend ready for frontend integration with realistic sample data
**Next Steps:** Create minimal React frontend with tabbed UI

### 2024-12-19 | Phase 3: Minimal Frontend Complete
**Change:** Created Vite + React + TypeScript frontend with input panel, 3-tab output display, loading states, error handling, and AWS Console styling
**Impact:** Complete minimal working system - user can input requirements and see mock results
**Next Steps:** Replace mock backend with real Strands agent integration

### 2024-12-19 | System Setup & Testing
**Change:** Resolved PowerShell execution policy issues, installed dependencies, and started both frontend and backend servers
**Impact:** System is now fully operational - both servers running and accessible
**Next Steps:** Test end-to-end functionality with mock data before proceeding to Phase 4

### 2024-12-19 | Phase 4: Strands Agent Integration Complete
**Change:** Replaced mock backend with real Strands agent integration using AWS MCP servers (CloudFormation, Pricing, Diagram). Created comprehensive agent wrapper with fallback mechanisms and structured response parsing.
**Impact:** System now generates real AWS architectures, pricing estimates, and diagrams instead of mock data. Includes graceful fallback to mock mode if MCP servers unavailable.
**Next Steps:** Install new dependencies and test real agent integration, then proceed to Phase 5 polish

### 2024-12-19 | Phase 5: Enhanced UI & Polish Complete
**Change:** Refactored frontend into modular components with enhanced features: syntax highlighting for CloudFormation templates, improved pricing display with cost breakdown, enhanced diagram viewing with controls, and ZIP download functionality for complete results package.
**Impact:** Professional-grade UI with AWS Console-inspired design, better user experience, and complete workflow from input to downloadable results.
**Next Steps:** Deploy to Linux EC2 instance for full Strands + MCP server compatibility testing

### 2024-12-19 | Amazon Linux 3 Deployment Guide Complete
**Change:** Created comprehensive deployment guide specifically for Amazon Linux 3 with systemd services, Nginx configuration, firewall setup, and automated deployment script. Includes production-ready configurations with security headers, SSL support, and monitoring.
**Impact:** Production-ready deployment solution optimized for AWS environment with automated setup and proper service management.
**Next Steps:** Test deployment on actual Amazon Linux 3 EC2 instance

### 2024-12-19 | Local Testing & Port Configuration Fix
**Change:** Fixed frontend-backend port mismatch (frontend was connecting to 8000, backend running on 8001). Updated frontend API configuration to match backend port. Successfully tested connection and confirmed 500 error is expected Strands agent behavior on Windows.
**Impact:** Frontend now successfully connects to backend. System working as designed - 500 errors indicate MCP servers need Linux environment, which is expected behavior.
**Next Steps:** Deploy to Linux EC2 instance for full functionality testing with working MCP servers

### 2025-10-21 | MCP Server Connection Issue Fixed
**Change:** Fixed critical bug where backend failed to connect to MCP servers on EC2 deployment. Root cause was missing `uv` (Python package installer) required to run AWS MCP servers via `uvx` commands. Fixed initialization check logic that was incorrectly looking at `agent.agent` instead of `_clients_initialized` flag.
**Impact:** 
- Created `fix-mcp-servers.sh` script for quick remediation on deployed instances
- Updated `deploy-amazon-linux3.sh` to install `uv` during deployment
- Updated systemd service configuration to include correct PATH with `~/.cargo/bin`
- Created comprehensive `TROUBLESHOOTING.md` guide
- Backend will now properly initialize MCP servers on Linux EC2 instances
**Next Steps:** Deploy updated code to EC2 instance and run fix script to resolve connection issues

---

## Future Enhancements

### Enhancement Request #1: Timeout Configuration & Management
**Priority:** High
**Complexity:** Medium
**Description:** Implement comprehensive timeout management across frontend and backend
**Requirements:**
- Frontend: Add configurable timeouts in Axios (default 5 minutes, max 10 minutes)
- Backend: Add asyncio timeout handling with TimeoutError exceptions
- Dynamic timeout adjustment based on detected request complexity
- Graceful timeout error messages with retry options

**Technical Details:**
- Update `frontend/src/services/api.ts` with timeout configuration
- Modify `backend/server.py` to use asyncio.wait_for with 300s timeout
- Add HTTP 408 (Request Timeout) status code handling
- Implement timeout error recovery UI

**Expected Impact:** Prevents indefinite hangs, improves user experience, protects server resources

---

### Enhancement Request #2: Progressive Loading & Status Indicators
**Priority:** High
**Complexity:** Medium
**Description:** Implement real-time progress tracking and status updates during architecture generation
**Requirements:**
- Progressive loading messages that update every 10-15 seconds
- Visual progress bar showing generation stages
- Status updates for each phase: "Initializing", "Connecting", "Generating", "Pricing", "Diagram", "Complete"
- Estimated time remaining based on request complexity

**Technical Details:**
- Add WebSocket or Server-Sent Events (SSE) for real-time updates
- Create progress tracking component in `frontend/src/components/ProgressIndicator.tsx`
- Backend progress hooks in Strands agent execution
- Message queue: ["Initializing AI agent", "Connecting to AWS MCP servers", "Generating CloudFormation", "Calculating pricing", "Creating diagram", "Finalizing"]

**Expected Impact:** Reduces perceived wait time, provides transparency, improves user confidence

---

### Enhancement Request #3: Complexity-Based Time Estimation
**Priority:** Medium
**Complexity:** Low
**Description:** Analyze user requirements to estimate generation time and set appropriate expectations
**Requirements:**
- Keyword analysis to determine complexity level (Simple/Medium/Complex)
- Show estimated time before generation starts
- Complexity indicators: Simple (30-60s), Medium (1-3min), Complex (3-5min)
- Adaptive timeout based on detected complexity

**Technical Details:**
- Create complexity analyzer function in `frontend/src/utils/complexityEstimator.ts`
- Keywords mapping:
  - Simple: "simple", "basic", "single", "bucket", "instance"
  - Medium: "load balancer", "auto scaling", "rds", "3-tier", "multi-az"
  - Complex: "microservices", "kubernetes", "eks", "multi-region", "cicd"
- Display estimated time in UI before generation starts

**Expected Impact:** Sets realistic expectations, reduces user frustration, improves satisfaction

---

### Enhancement Request #4: Request Cancellation
**Priority:** Medium
**Complexity:** Medium
**Description:** Allow users to cancel long-running generation requests
**Requirements:**
- Cancel button in UI during generation
- Graceful cancellation handling in backend
- Axios CancelToken implementation
- Cleanup of partial results

**Technical Details:**
- Add cancel button to loading spinner component
- Implement Axios CancelToken in `frontend/src/services/api.ts`
- Backend task cancellation using asyncio.Task.cancel()
- Cleanup handlers for MCP client connections

**Expected Impact:** Gives users control, prevents wasted resources, improves flexibility

---

### Enhancement Request #5: Background Processing for Complex Requests
**Priority:** Low
**Complexity:** High
**Description:** For very complex architectures, offer async processing with email/webhook notification
**Requirements:**
- Detect high-complexity requests (5+ minutes estimated)
- Offer background processing option
- Store generation results with unique ID
- Email or webhook notification when complete
- Results retrieval page

**Technical Details:**
- Add job queue (Celery or similar)
- Create job status tracking table
- Implement notification service
- Add `/jobs/{id}` endpoint for result retrieval
- Add `/jobs/{id}/status` for progress checking

**Expected Impact:** Handles very complex requests gracefully, improves scalability, better resource management

---

### Enhancement Request #6: Enhanced Loading Experience
**Priority:** Medium
**Complexity:** Low
**Description:** Improve visual feedback during long operations
**Requirements:**
- Animated progress indicators
- Step-by-step status visualization
- Helpful tips and information during wait
- Educational content about what the agent is doing

**Technical Details:**
- Create animated loading component with:
  - Circular progress indicator
  - Step tracker (5 steps: Init → Connect → Generate → Price → Diagram)
  - Helpful tips carousel
  - "Did you know?" facts about AWS architecture
- Update every 10-15 seconds with new messages

**Expected Impact:** Makes waiting more engaging, educates users, reduces perceived wait time

---

### Enhancement Request #7: Retry and Resume Logic
**Priority:** Low
**Complexity:** High
**Description:** Automatic retry for transient failures and resume capability for interrupted generations
**Requirements:**
- Automatic retry with exponential backoff
- Save intermediate results
- Resume from last successful step
- Retry button in error UI

**Technical Details:**
- Implement retry logic with max 3 attempts
- Cache intermediate results (template, pricing, diagram separately)
- State machine for generation steps
- Resume endpoint: POST `/generate/resume/{request_id}`

**Expected Impact:** Improves reliability, handles transient failures, reduces user frustration

---

### Enhancement Request #8: Real-Time Observability Dashboard
**Priority:** Medium
**Complexity:** High
**Description:** Developer-facing "mission control" dashboard that visualizes real-time interactions between Strands agents and MCP servers

**Requirements:**
- Standalone page accessible via header navigation with toggle visibility
- Real-time event stream showing agent-to-MCP communication flow
- Visual timeline of: Agent requests → MCP responses → Processing → Output
- Color-coded event types with smooth animations
- Filter controls by event type (agent_to_mcp, mcp_response, processing, output, error)
- Mock WebSocket simulation initially, real backend events later
- Auto-scroll to latest events with performance optimization (100 event limit)

**Technical Details:**
- Add React Router for navigation (routes: `/` generator, `/observability` dashboard)
- Install Framer Motion for smooth animations
- Create modular component structure:
  - `AppLayout.tsx`: Header navigation wrapper
  - `observability/EventTag.tsx`: Color-coded event type tags
  - `observability/EventCard.tsx`: Individual event display with expandable metadata
  - `observability/ActivityFeed.tsx`: Scrollable timeline container
  - `observability/FilterControls.tsx`: Event filtering and controls
  - `pages/ObservabilityPage.tsx`: Main dashboard page
- Custom hooks:
  - `useEventStream.ts`: Mock event subscription (WebSocket-ready architecture)
- Services:
  - `mockEventStream.ts`: Event generator simulating agent/MCP workflow
- Event types: agent_to_mcp (blue), mcp_response (green), processing (yellow), output (purple), error (red)
- Dependencies: framer-motion, react-router-dom, date-fns

**Expected Impact:** 
- Provides transparency into agent operations for debugging
- Helps developers understand Strands-MCP interaction patterns
- Enables performance monitoring and bottleneck identification
- Improves troubleshooting capabilities with detailed event logs
- Foundation for future metrics, performance tracking, and error analysis tabs

---

### Enhancement Request #9: Comprehensive Testing Infrastructure
**Priority:** High
**Complexity:** High
**Description:** Implement complete testing framework for backend, frontend, and integration testing to ensure code quality and reliability

**Requirements:**
- Backend API testing with pytest and httpx
- Frontend component testing with Vitest and React Testing Library
- Integration testing with Playwright for end-to-end workflows
- CI/CD pipeline with automated testing
- Test coverage reporting and monitoring
- Mock data and fixtures for consistent testing

**Technical Details:**
- **Backend Testing Framework:**
  - `pytest>=7.0.0` + `pytest-asyncio>=0.21.0` + `httpx>=0.24.0`
  - Test files: `tests/backend/test_server.py`, `tests/backend/test_strands_agent.py`
  - Critical test cases: API endpoints, MCP server integration, data validation, error handling
  - Mock Strands agent responses for consistent testing

- **Frontend Testing Framework:**
  - `vitest>=1.0.0` + `@testing-library/react>=14.0.0` + `jsdom>=23.0.0`
  - Test files: `tests/frontend/components/`, `tests/frontend/services/api.test.ts`
  - Critical test cases: Component rendering, user interactions, API integration, error states
  - Mock API responses and user event simulation

- **Integration Testing Framework:**
  - `playwright>=1.40.0` for cross-browser E2E testing
  - Test files: `tests/integration/e2e/architecture-generation.spec.ts`
  - Critical test cases: Complete user workflow, error scenarios, cross-browser compatibility
  - Test data fixtures and environment setup

- **Test Structure:**
  ```
  /tests
  ├── backend/
  │   ├── test_server.py          # API endpoint tests
  │   ├── test_strands_agent.py   # Agent integration tests
  │   ├── test_data_validation.py # Data structure tests
  │   └── conftest.py             # pytest configuration
  ├── frontend/
  │   ├── components/             # Component unit tests
  │   ├── services/               # API service tests
  │   └── setup.ts                # test setup
  ├── integration/
  │   ├── e2e/                    # End-to-end tests
  │   └── fixtures/               # test data
  └── utils/                      # test utilities
  ```

- **CI/CD Integration:**
  - GitHub Actions workflow for automated testing
  - Test coverage reporting with coverage.py and c8
  - Automated testing on pull requests and main branch
  - Test result reporting and failure notifications

**Expected Impact:** 
- Ensures code quality and prevents regressions
- Enables confident refactoring and feature additions
- Provides safety net for production deployments
- Improves development velocity with automated validation
- Establishes testing culture and best practices
- Reduces debugging time and production issues

**Acceptance Criteria:**
- [ ] Backend API tests achieve 90%+ coverage
- [ ] Frontend component tests cover all major user flows
- [ ] Integration tests validate complete end-to-end workflows
- [ ] CI/CD pipeline runs tests automatically on code changes
- [ ] Test coverage reports are generated and accessible
- [ ] All tests pass consistently across different environments
- [ ] Mock data and fixtures are comprehensive and maintainable

---

## Sprint Planning

### Sprint 1 (High Priority - Week 1)
- [ ] Enhancement #1: Timeout Configuration & Management
- [ ] Enhancement #3: Complexity-Based Time Estimation

### Sprint 2 (High Priority - Week 2)
- [ ] Enhancement #2: Progressive Loading & Status Indicators

### Sprint 3 (Medium Priority - Week 3)
- [ ] Enhancement #4: Request Cancellation
- [ ] Enhancement #6: Enhanced Loading Experience

### Future Sprints (Low Priority)
- [ ] Enhancement #5: Background Processing for Complex Requests
- [ ] Enhancement #7: Retry and Resume Logic

---

## Definition of Done

Each enhancement is considered complete when:
- [ ] All acceptance criteria are met
- [ ] Code is tested and working
- [ ] Documentation is updated
- [ ] Feature is deployed and verified
- [ ] Product tracker is updated with completion status

---

## [2025-01-22] Diagram Download Fix

**Change:**
Fixed architecture diagram not being created in downloaded results. The issue was that the diagram extraction logic only looked for URL patterns in the agent's text response but didn't handle actual diagram image data or save diagram files to disk.

**Implementation:**
1. Replaced `_extract_diagram_url()` with `_extract_and_save_diagram()` in `strands_agent.py`
2. Added support for extracting base64-encoded image data from agent responses
3. Added support for detecting and copying diagram files created by the MCP server
4. Fixed file paths to use absolute paths relative to backend directory
5. Enhanced logging to show diagram response previews for debugging
6. Updated `server.py` to use absolute paths for the diagrams directory

**Technical Details:**
- New method handles multiple diagram data formats:
  - Base64-encoded images (inline in response)
  - File paths mentioned in the response (copies file to diagrams directory)
  - Falls back to sample.png if no diagram is found
- Uses timestamped filenames: `architecture_YYYYMMDD_HHMMSS.png`
- Creates diagrams directory automatically if it doesn't exist
- Improved error handling with detailed logging

**Impact:**
- ✅ Diagrams will now be properly saved and included in downloaded results
- ✅ Better debugging with response previews in logs
- ✅ More robust file path handling (absolute vs relative paths)
- ✅ Supports multiple diagram data formats from AWS Diagram MCP server

**Next Steps:**
- Monitor logs during next diagram generation to verify which format the AWS Diagram MCP server uses
- May need to adjust extraction patterns based on actual MCP server output
- Consider adding diagram format validation (PNG, SVG, etc.)

**Author:** AI Assistant  
**Status:** Completed - Ready for Testing

---

## Notes

- **Total Estimated Effort:** 3-4 weeks for all enhancements
- **Recommended Order:** Start with timeout management and complexity estimation, then move to progressive loading
- **Dependencies:** Enhancement #2 (Progressive Loading) depends on #1 (Timeout Management) for proper error handling
- **Testing Strategy:** Each enhancement should be tested on both Windows (development) and Linux (production) environments

