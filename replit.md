# Replit Configuration

## Overview

This is a full-stack meme generator application built with React frontend and Express backend. The app allows users to browse popular meme templates from Imgflip API, create custom memes with text overlays, and manage their generated memes. It features a modern UI built with shadcn/ui components and Tailwind CSS, with real-time meme generation capabilities and AI-powered caption generation using Google Gemini.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **API Design**: RESTful API with standardized error handling middleware
- **Development**: Hot reload with Vite integration in development mode
- **Static Assets**: Serves React build in production with fallback routing

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Fallback Storage**: In-memory storage implementation for development/testing
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment

### Key Data Models
- **Meme Templates**: Stores template metadata (id, name, url, dimensions, text box count)
- **Generated Memes**: Tracks user-created memes with template reference and custom text
- **Caching Strategy**: Template data cached to reduce API calls to Imgflip

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple
- **Security**: CORS enabled, JSON parsing middleware, and request logging

### API Architecture
- **Template Endpoint**: `/api/templates` - Fetches and caches popular meme templates
- **Meme Generation**: `/api/memes/generate` - Creates memes via Imgflip API
- **Recent Memes**: `/api/memes/recent` - Retrieves user's generated memes
- **AI Caption Generation**: `/api/captions/generate` - Generates witty meme captions using Google Gemini
- **Cache Management**: `/api/templates/clear-cache` - Clears template cache for updates
- **Error Handling**: Centralized error middleware with structured JSON responses

## External Dependencies

### Third-Party APIs
- **Imgflip API**: Primary meme template source and meme generation service
  - Get popular templates: `https://api.imgflip.com/get_memes`
  - Generate memes: `https://api.imgflip.com/caption_image`
  - Requires username/password authentication via environment variables
- **Google Gemini AI**: AI-powered caption generation service
  - Model: `gemini-1.5-flash` for fast, creative text generation
  - Generates contextual and witty meme captions based on user topics
  - Requires GEMINI_API_KEY authentication via environment variables

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: Environment-based DATABASE_URL configuration

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Development Banner**: Replit development banner for external preview
- **Hot Reload**: Vite HMR with Express middleware integration

### UI Component Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for template browsing
- **Class Variance Authority**: Type-safe component variant management

### Build and Deployment
- **Vite**: Frontend build tool with React plugin and TypeScript support
- **ESBuild**: Backend bundling for production deployment
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **TypeScript**: Full-stack type safety with shared schema definitions