# Overview

This is a single-page authentication system built with React that uses Firebase for authentication. The application provides email/password registration/login and Google OAuth sign-in. It features a modern, responsive UI built with shadcn/ui components and Tailwind CSS. The backend includes MySQL database integration with fallback to in-memory storage for development, primarily used for session management and additional user data storage.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management
- **Application Structure**: Single-page application with conditional rendering based on authentication state
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Dual authentication system supporting both JWT tokens and Replit OAuth
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Password Security**: bcrypt for password hashing and validation

## Database Architecture
- **Database**: MySQL with fallback to in-memory storage for development
- **ORM**: Drizzle ORM for type-safe database operations  
- **Schema Management**: Direct SQL table creation with auto-migration
- **Tables**: Users table with support for both OAuth and email/password authentication, sessions table for session storage

## Authentication & Authorization
- **Dual Authentication**: 
  - JWT-based authentication for email/password users
  - OpenID Connect (OIDC) integration with Replit for OAuth users
- **Session Management**: Secure session handling with HTTP-only cookies
- **Password Security**: Industry-standard bcrypt hashing with salt rounds
- **Authorization**: Route-level protection with authentication middleware

## Development & Build Tools
- **Build System**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement and development server integration
- **TypeScript**: Strict type checking with path mapping for clean imports
- **Code Quality**: ESBuild for server-side bundling and optimization

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM for PostgreSQL operations
- **express**: Web application framework for the backend API
- **react**: Frontend UI library with TypeScript support

## Authentication & Security
- **openid-client**: OpenID Connect client for Replit OAuth integration
- **passport**: Authentication middleware for Express
- **bcrypt**: Password hashing and validation library
- **jsonwebtoken**: JWT token generation and validation
- **express-session**: Session management middleware

## UI & Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library for consistent iconography

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