# Overview

This is a Firebase-only web application built with React and Node.js. The app uses Firebase Authentication for user management and Firestore database for data storage. It features a modern, mobile-first responsive UI built with React Bootstrap components. The authentication system includes login, registration, Google OAuth, and password reset functionality with a streamlined UI - password reset is handled via popup modal instead of a separate tab. The backend is minimal and only serves the React app, with all authentication and database operations handled client-side through Firebase.

## Recent Changes
- **Successfully configured email verification system with Firebase (August 2025)**:
  - Fixed email verification to use Firebase's built-in system for proper verification link handling
  - Enhanced pending approval interface with prominent resend verification functionality
  - Users in pending approval state now see clear email verification section with resend button
  - Verification emails use Firebase's native system which works seamlessly with custom email verification page
  - Firebase verification links properly redirect to /email-verification page for in-app verification
  - SendGrid infrastructure remains available for future custom email notifications
- **Added comprehensive email verification system (August 2025)**:
  - Created dedicated email verification page at /verify-email and /email-verification routes
  - Implemented full Firebase action code handling for email verification
  - Added SendGrid integration for professional verification email sending
  - Created custom HTML email templates with responsive design
  - Built server-side API endpoints for email sending and status checking
  - Added automatic Firestore user document updates on successful verification
  - Included comprehensive error handling for expired and invalid links
  - Added mobile-responsive verification UI with Bootstrap styling
- **Successfully set up Android APK generation capabilities (August 2025)**:
  - Configured Capacitor for mobile app development with proper Android platform setup
  - Created comprehensive build guide (BUILD-APK-GUIDE.md) with step-by-step instructions
  - Set up automated build script (scripts/build-apk.sh) for streamlined APK preparation
  - Configured app with ID com.authflow.app and name AuthFlow for Play Store publishing
  - Ensured Firebase authentication works seamlessly in mobile environment
  - Web assets properly sync to Android project for native app compilation
- **Added full CRUD functionality to admin dashboard (August 2025)**:
  - Implemented Create User functionality with automatic approval and email verification bypass
  - Added Edit User capability to modify user details and roles
  - Implemented Delete User functionality with confirmation modal
  - Fixed invalid date display issue in user tables with proper timestamp formatting
  - Added helpful tooltips to all admin action buttons for better UX
  - Corrected stats calculation to properly count active users vs approved users
- **Successfully migrated from Replit Agent to standard Replit environment (August 2025)**:
  - Migrated project to proper client/server separation for enhanced security
  - Updated Firebase Authentication to work with standard Replit deployment
  - Created Firebase-based admin authentication system (admin@system.local / AdminPass123!)
  - Removed all PostgreSQL and MySQL dependencies - now fully Firebase/Firestore only
  - Updated useFirebaseAuth hook to include userData fetching for role-based access
  - Admin users now authenticate through Firebase Auth instead of database-only approach
- **Successfully migrated to Firestore-only architecture (August 2025)**:
  - Removed PostgreSQL and converted entirely to Firebase Firestore database
  - All user data, roles, and permissions now stored in Firestore collections
  - Streamlined registration process with single "Create Account" form including role selection
  - Limited role selection to student and instructor only (admin roles managed by administrators)  
  - Admin user stored directly in Firestore with proper authentication flow
  - Simplified backend to serve only static files, all database operations client-side
- **Successfully implemented hybrid Firebase auth + PostgreSQL database architecture (August 2025)**:
  - Created comprehensive role-based signup system preventing admin role selection during registration  
  - Built database-driven user approval workflow where all new users default to pending status
  - Implemented DatabaseAdminDashboard with full user management capabilities (approve/reject/role changes)
  - Created default super admin account with credentials (admin@system.local / AdminPass123!) for initial system access
  - **Integrated in-app email verification and password reset functionality**:
    - Moved resend verification to alert notification instead of button for better UX
    - Implemented PasswordResetModal for in-app password management without external Firebase redirects
    - Created PendingApprovalMessage component for seamless user status feedback
- All dependencies properly installed and configured for Replit compatibility
- Fixed Firebase authentication configuration with proper API keys
- **Previous role-based access control system (January 2025)**:
  - Added 5 user roles: admin, manager, coordinator, instructor, student
  - Created role-specific dashboards with tailored functionality and permissions
  - Implemented role management functions for admins (assign roles, toggle user status)
  - Added role hierarchy system with proper access controls
  - Updated Firebase schema to include role, permissions, and isActive fields
  - Created role-based hooks (useRoles, usePermissions) for authentication
  - All new users default to 'student' role with basic permissions
  - Admin dashboard includes complete user management with role assignment
  - Each role has specific dashboard layout with relevant functionality
- Extended alert display time from 5 to 10 seconds for better user experience
- Changed authentication UI from tabs to single form with "Create an account" link
- Updated registration button color from green to blue (primary variant)
- Improved authentication flow with cleaner navigation between login and signup
- Added email verification requirement - users cannot login without verified emails
- Removed all posts functionality from dashboard, keeping only user information section
- Reduced font sizes and input/button heights to 14px and 38px respectively for compact design
- Added automatic navbar collapse functionality on route changes and login state changes
- Created user profile page with edit basic info and password change functionality
- Added resend verification email option from login screen when verification fails
- Implemented in-app password reset functionality with proper re-authentication
- Added navigation links to Dashboard and Profile in navbar for authenticated users
- Implemented email duplicate checking to prevent account conflicts
- Added intelligent user flow: existing users are redirected to sign in, Google users are directed to Google auth
- Enhanced Google authentication to update existing user data when signing in

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: React Bootstrap for responsive, mobile-first components
- **Styling**: Bootstrap 5 with custom CSS for enhanced styling
- **State Management**: TanStack Query (React Query) for client state management
- **Application Structure**: Single-page application with Firebase authentication state management
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Routing**: Wouter for lightweight client-side routing

## Backend Architecture
- **Runtime**: Node.js with Express.js framework (minimal server)
- **Language**: TypeScript with ES modules
- **Purpose**: Static file serving and basic health checks only
- **Database**: All data operations handled client-side via Firebase

## Database Architecture
- **Database**: Firebase Firestore (NoSQL document database) - ONLY DATABASE
- **Collections**: 
  - Users collection for user profiles with role and permission data
  - Role_changes collection for audit trail of role modifications
  - All data operations performed client-side with Firebase SDK
  - No PostgreSQL or other databases used
  - Posts collection for user content (legacy, not currently used)
- **Schema**: TypeScript interfaces for type safety with Zod validation
- **Role System**: Each user document includes role, permissions array, and isActive status
- **Real-time**: Firestore real-time listeners for live data updates

## Authentication & Authorization
- **Firebase Authentication**: 
  - Email/password authentication with email verification
  - Google OAuth sign-in
  - Password reset functionality
- **Role-Based Access Control (RBAC)**:
  - 5 user roles: admin, manager, coordinator, instructor, student
  - Role-specific permissions and dashboard access
  - Hierarchical role management (admin > manager > coordinator > instructor > student)
  - Role assignment and user status management for authorized users
  - Default role assignment (student) for new registrations
- **Security**: Firebase handles all security, encryption, and session management
- **Authorization**: Client-side route protection based on Firebase auth state and user roles

## Development & Build Tools
- **Build System**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement and development server integration
- **TypeScript**: Strict type checking with path mapping for clean imports
- **Code Quality**: ESBuild for server-side bundling and optimization

# External Dependencies

## Core Framework Dependencies
- **firebase**: Complete Firebase SDK for authentication and database
- **express**: Minimal web server for serving the React app
- **react**: Frontend UI library with TypeScript support
- **react-bootstrap**: Bootstrap components for React

## Authentication & Database
- **firebase/auth**: Firebase Authentication for user management
- **firebase/firestore**: Firestore database for data storage
- **react-hook-form**: Form state management and validation
- **zod**: Runtime type validation and schema definition

## UI & Styling
- **bootstrap**: CSS framework for responsive design
- **react-bootstrap**: Bootstrap components optimized for React
- **react-icons**: Icon library including Font Awesome icons
- **wouter**: Lightweight routing for React applications

## Development Tools
- **vite**: Build tool and development server
- **@vitejs/plugin-react**: React plugin for Vite
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development tools and error handling

## Data Management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers for Zod integration
- **zod**: Runtime type validation and schema definition