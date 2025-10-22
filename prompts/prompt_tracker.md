# Prompt Tracker

Track evolution of prompts used for UI design, backend logic, and architecture decisions.

## Format
Version | Prompt | Outcome | Learnings

---

## Entries

### v1.0 - Initial UI Requirements
**Prompt:** Build ultra modern, single-page web app (React + Tailwind + TypeScript) with clean dashboard UI, input panel for requirements, output panel with 3 tabs (CloudFormation, Pricing, Diagram), loading states, error handling, and AWS Console aesthetic
**Outcome:** Comprehensive plan created with 5 phases from foundation to polish
**Learnings:** User prefers minimal-first approach with tracking systems for evolution

### v1.1 - Development Philosophy
**Prompt:** Keep it minimal, stay organized, track everything, implement mock-first, focus on clarity and long-term maintainability
**Outcome:** Refined plan emphasizing minimal viable product first, then iterative enhancement
**Learnings:** Mock-first approach reduces complexity and enables faster validation of UX flow

### v2.0 - Strands Agent Integration Prompt
**Prompt:** Generate a complete AWS architecture based on these requirements: "{requirements}". Please provide: 1. A complete CloudFormation template (YAML format) with all necessary resources, 2. A detailed cost estimate with monthly pricing breakdown, 3. An architecture diagram showing the components and their relationships. For the CloudFormation template: Include all necessary resources (VPC, subnets, security groups, etc.), Use best practices and proper resource naming, Include outputs for important values. For the pricing: Calculate monthly costs for all resources, Break down costs by service, Include region and currency information. For the diagram: Create a visual representation of the architecture, Show data flow and component relationships, Use standard AWS icons and naming conventions.
**Outcome:** Comprehensive prompt designed to extract structured data from Strands agent response
**Learnings:** Detailed prompting is crucial for getting structured output from AI agents

### v3.0 - Phase 5 UI Enhancement Approach
**Prompt:** Refactor the single-file React component into modular components with enhanced features: syntax highlighting for CloudFormation templates, improved pricing display with detailed breakdown, enhanced diagram viewing with download/zoom controls, and complete results packaging as ZIP downloads.
**Outcome:** Professional, modular UI with AWS Console-inspired design and complete workflow
**Learnings:** Component-based architecture improves maintainability and user experience
**Next Focus:** Production deployment on Linux EC2 instance

### v4.0 - Minimal Mode Activation
**Prompt:** Activate minimal development mode with focus on essential features only, clean code practices, and lean development approach
**Outcome:** Comprehensive minimal mode configuration established with clear principles and project alignment
**Learnings:** Minimal mode enforces discipline and prevents feature creep while maintaining quality
**Next Focus:** Essential enhancements only - timeout management and complexity estimation

### v5.0 - Phase 1 UX Enhancement Implementation
**Prompt:** Implement Phase 1 essential UX improvements: Enhanced input experience with validation and suggestions, improved loading states with progress indicators and cancel functionality, and quick actions for results (copy, download, share)
**Outcome:** Successfully implemented comprehensive UX improvements while maintaining minimal mode principles. Enhanced user input guidance, better loading feedback, and professional result interaction capabilities
**Learnings:** UX improvements can significantly enhance user experience without adding unnecessary complexity when implemented thoughtfully
**Next Focus:** Phase 2: Solution Management (history, templates, save/load functionality)

