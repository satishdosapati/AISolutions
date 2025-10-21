# AWS Agentic Web UI - Frontend

React + TypeScript + Tailwind CSS frontend for the AWS Agentic Web UI.

## Prerequisites

Make sure you have Node.js installed (see main README.md for installation instructions).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Development

- **Hot reload:** Changes to source files will automatically reload the page
- **TypeScript:** Full type safety and IntelliSense support
- **Tailwind CSS:** Utility-first CSS framework with AWS Console styling

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── App.tsx                    # Main application component
├── main.tsx                   # React entry point
├── index.css                  # Global styles with Tailwind
├── router.tsx                 # React Router configuration
├── components/                # Reusable UI components
│   ├── AppLayout.tsx          # Main layout wrapper
│   ├── InputPanel.tsx         # Requirements input form
│   ├── OutputPanel.tsx        # Results display tabs
│   ├── CloudFormationTab.tsx  # CloudFormation template display
│   ├── PricingTab.tsx         # Cost estimation display
│   ├── DiagramTab.tsx         # Architecture diagram viewer
│   ├── ErrorAlert.tsx         # Error message component
│   ├── LoadingSpinner.tsx     # Loading indicator
│   ├── SaveResultsButton.tsx  # Download functionality
│   └── observability/         # Observability dashboard components
│       ├── ActivityFeed.tsx   # Event stream display
│       ├── EventCard.tsx      # Individual event display
│       ├── EventTag.tsx       # Event type indicators
│       └── FilterControls.tsx # Event filtering
├── pages/
│   └── ObservabilityPage.tsx  # Observability dashboard page
├── hooks/
│   └── useEventStream.ts      # Event streaming hook
└── services/
    ├── api.ts                 # Backend API communication
    └── mockEventStream.ts     # Mock event data for development
```

## Current Features (Phase 5 Complete)

- ✅ **Modular component architecture** with TypeScript
- ✅ **React Router** for multi-page navigation
- ✅ **Input panel** for architecture requirements
- ✅ **Tabbed output display** (CloudFormation, Pricing, Diagram)
- ✅ **Syntax highlighting** for CloudFormation templates
- ✅ **Enhanced pricing display** with cost breakdown
- ✅ **Professional diagram viewing** with controls
- ✅ **ZIP download** for complete results package
- ✅ **Real-time observability dashboard** with event streaming
- ✅ **Activity feed** with detailed event tracking
- ✅ **Filter controls** for event types and time ranges
- ✅ **Loading states and error handling**
- ✅ **AWS Console-inspired dark theme**
- ✅ **Responsive design** for all screen sizes
- ✅ **Smooth animations** with Framer Motion

## Dependencies

### Core Dependencies
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router DOM** - Client-side routing

### UI Components
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **React Syntax Highlighter** - Code syntax highlighting

### Utilities
- **Axios** - HTTP client
- **File Saver** - File download functionality
- **JSZip** - ZIP file creation
- **Date-fns** - Date manipulation

## Next Steps (Phase 6)

- [ ] **Authentication system** (Google OAuth integration)
- [ ] **User management** and session handling
- [ ] **Usage analytics** and tracking
- [ ] **Advanced filtering** and search capabilities
- [ ] **Export options** (PDF, different formats)
- [ ] **Performance optimization** and caching
