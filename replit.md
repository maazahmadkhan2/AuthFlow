# Overview

This is a Firebase-only web application built with React and Node.js. The app uses Firebase Authentication for user management and Firestore database for data storage. It features a modern, mobile-first responsive UI built with React Bootstrap components. The authentication system includes login, registration, Google OAuth, and password reset functionality with a streamlined UI - password reset is handled via popup modal instead of a separate tab. The backend is minimal and only serves the React app, with all authentication and database operations handled client-side through Firebase.

## Recent Changes
- Successfully migrated from Replit Agent to standard Replit environment
- Fixed Firebase authentication configuration with proper API keys
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
- **Database**: Firebase Firestore (NoSQL document database)
- **Collections**: Users collection for user profiles, Posts collection for user content
- **Schema**: TypeScript interfaces for type safety with Zod validation
- **Real-time**: Firestore real-time listeners for live data updates

## Authentication & Authorization
- **Firebase Authentication**: 
  - Email/password authentication with email verification
  - Google OAuth sign-in
  - Password reset functionality
- **Security**: Firebase handles all security, encryption, and session management
- **Authorization**: Client-side route protection based on Firebase auth state

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