# HealthTracker - Health Measurement Tracking Application

## Overview

HealthTracker is a Progressive Web Application (PWA) designed for health monitoring and measurement tracking. The application allows users to record various health measurements (glucose, blood pressure, weight, temperature) and share access with healthcare professionals. It features a modern React frontend with TypeScript, Express.js backend, and PostgreSQL database using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **Build Tool**: Vite for development and production builds
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Middleware**: Session management, authentication, and error handling
- **Development**: tsx for TypeScript execution in development

### Data Storage
- **Database**: PostgreSQL 16 (configured via Replit modules)
- **ORM**: Drizzle ORM with type-safe queries
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database serverless connection with WebSocket support
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

## Key Components

### Authentication System
- **Provider**: Replit Authentication with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **User Types**: Patient and Doctor roles with different access levels
- **Security**: HTTP-only cookies, secure sessions, CSRF protection

### Health Measurement System
- **Measurement Types**: Configurable measurement categories (glucose, blood pressure, etc.)
- **Food Context**: Meal timing context for measurements (fasting, pre-meal, post-meal)
- **Data Validation**: Zod schemas for input validation and type safety
- **Temporal Queries**: Date range filtering and statistical analysis

### Doctor-Patient Access
- **Access Control**: Patients can grant doctors access to their measurements
- **Data Sharing**: Secure sharing mechanism with email-based invitations
- **Role Management**: Different UI experiences for patients vs doctors

### Progressive Web App Features
- **Offline Capability**: Service worker configuration for offline functionality
- **Mobile Optimization**: Responsive design with mobile-first approach
- **App Manifest**: PWA manifest for installable experience
- **Icons**: Multiple icon sizes for different platforms

## Data Flow

1. **Authentication Flow**: User authenticates via Replit Auth → Session created → User data stored/retrieved
2. **Measurement Recording**: User inputs measurement → Validation → Database storage → Real-time UI updates
3. **Data Visualization**: Measurements queried → Statistical analysis → Chart rendering via Recharts
4. **Doctor Access**: Patient invites doctor → Access record created → Doctor can view patient data
5. **Settings Management**: Users can configure measurement types and food contexts

## External Dependencies

### Core Dependencies
- **Database**: Neon Database for PostgreSQL hosting
- **Authentication**: Replit Authentication service
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Inter) for typography

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **Type Checking**: TypeScript compiler
- **Code Quality**: ESLint configuration
- **Hot Reload**: Vite HMR with error overlay

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20
- **Database**: PostgreSQL 16 module
- **Development Server**: Vite dev server with Express API
- **Port Configuration**: Port 5000 mapped to external port 80

### Production Build
- **Frontend**: Vite build process generates optimized static assets
- **Backend**: esbuild bundles server code for Node.js deployment
- **Database**: Environment-based connection string configuration
- **Deployment Target**: Replit Autoscale deployment

### Environment Configuration
- **Session Secret**: Required for session security
- **Database URL**: PostgreSQL connection string
- **REPLIT_DOMAINS**: Domain whitelist for authentication
- **Development Mode**: Conditional development features

## Changelog

```
Changelog:
- June 24, 2025. Initial setup and full implementation
- Created complete health tracking SaaS application
- Implemented Replit authentication with database integration
- Built measurement tracking with CRUD operations
- Added glassmorphism design system with mobile-first approach
- Created doctor-patient sharing functionality
- Implemented charts and statistics dashboard
- Fixed validation issues in measurement registration
- Added PWA capabilities with service worker
- Enhanced charts with smooth curved lines and gradient fill areas
- Improved user experience with better data visualization
- Added comprehensive history page with detailed analytics and context breakdown
- Implemented multi-metric dashboard with summary cards and trend analysis
- Updated charts to use smooth Bézier curves (type="monotone") for better visual flow
- Fixed navigation alignment and implemented global bottom navigation
- Optimized layout by moving dates inside measurement cards
- Finalized bottom navigation menu with proper z-index and positioning
- Resolved preview display issue - menu works correctly in new tab/window
- Application ready for deployment with all features working correctly
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```