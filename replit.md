# Voice Calculator

## Overview

A modern voice-enabled calculator application built with React and TypeScript. The application features a mobile-first design with both traditional button input and voice recognition capabilities. Users can perform mathematical calculations through touch interactions or voice commands, making it accessible and convenient for various use cases.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript for type safety and modern development patterns.

**Styling**: Tailwind CSS with a custom design system using shadcn/ui components for consistent UI elements. The application uses CSS variables for theming and supports both light and responsive design patterns.

**State Management**: Custom React hooks (`useVoiceCalculator`) manage calculator state and voice recognition logic. React Query handles any future API interactions with optimistic updates and caching.

**Routing**: Wouter provides lightweight client-side routing with a simple route structure (calculator page and 404 fallback).

**Voice Integration**: Web Speech API for speech recognition and synthesis, wrapped in custom hooks (`useSpeechSynthesis`, `use-voice-calculator`) for reusable voice functionality.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running in ESM mode for modern JavaScript support.

**Build System**: Vite for development and production builds with hot module replacement and optimized bundling.

**Development Tools**: Custom development server with request logging, error handling middleware, and Vite integration for seamless development experience.

### Data Storage Solutions

**Database**: PostgreSQL configured through Drizzle ORM with type-safe schema definitions.

**ORM**: Drizzle ORM provides type-safe database operations with automatic TypeScript inference and migration support.

**Session Storage**: Prepared for connect-pg-simple for PostgreSQL-based session management.

**Development Storage**: In-memory storage implementation for development/testing scenarios.

### Authentication and Authorization

**Architecture**: Basic user schema defined with username/password fields, ready for implementation of authentication middleware.

**Schema**: Zod validation schemas ensure type safety for user input validation and API request/response handling.

### Mobile Optimization

**Responsive Design**: Mobile-first approach with touch-optimized buttons and adaptive layouts.

**Progressive Web App**: Configured with proper viewport settings and mobile-friendly meta tags.

**Touch Interactions**: Custom button components with haptic feedback classes and touch-optimized sizing.

## External Dependencies

### Core Framework Dependencies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type safety across the entire application
- **Vite**: Fast build tool and development server
- **Express.js**: Backend server framework

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library for consistent iconography

### Database and ORM
- **Neon Database**: Serverless PostgreSQL provider
- **Drizzle ORM**: Type-safe database toolkit
- **Drizzle Kit**: Database migration and development tools

### Voice and Speech
- **Web Speech API**: Browser-native speech recognition and synthesis
- **Custom hooks**: Abstracted voice functionality for cross-browser compatibility

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **React Query**: Server state management and caching

### Validation and Forms
- **Zod**: Schema validation library
- **React Hook Form**: Form management with validation
- **@hookform/resolvers**: Zod integration for form validation

### Utility Libraries
- **clsx**: Conditional className utility
- **date-fns**: Date manipulation library
- **class-variance-authority**: Component variant management