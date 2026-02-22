# WanderWise AI Frontend

Next.js frontend application for WanderWise AI - an AI-powered travel planning web application.

## Technology Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4
- **React**: 19.2.3

## Setup

### Prerequisites

- Node.js 18+ 
- npm

### Installation

Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/                 # Next.js App Router pages and layouts
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles with Tailwind
├── public/             # Static assets
├── next.config.ts      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── README.md          # This file
```

## Styling

This project uses Tailwind CSS 4 for styling. The configuration can be found in `tailwind.config.ts`.

Global styles are located in `app/globals.css`.

## API Integration

The frontend connects to the backend API running at:
- Development: `http://localhost:8000`

## Type Safety

TypeScript is configured with strict mode enabled. Type definitions are automatically generated for Next.js and React.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
