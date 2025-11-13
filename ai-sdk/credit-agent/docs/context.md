# Credit Agent Project Context

## Project Overview

**Credit Agent** is a Next.js web application created as part of the RunPod AI SDK examples. This is a **bare-bones starter project** that has been initialized but not yet developed with specific functionality. It serves as a foundation for building an agent-based system, likely for managing or handling credit-related operations.

**Current Status**: Bootstrap/boilerplate phase - the project contains the default Next.js setup and requires feature development.

---

## Technology Stack

### Core Technologies

- **Framework**: [Next.js 16.0.0](https://nextjs.org) - React meta-framework with server-side rendering, API routes, and file-based routing
- **Runtime**: Node.js (server-side) + Browser (client-side)
- **Language**: TypeScript 5.x with strict mode enabled
- **React**: Version 19.2.0 with React Compiler enabled for performance optimization

### Styling & UI

- **Tailwind CSS 4.x** - Utility-first CSS framework
- **PostCSS 4.x** - CSS processing via `@tailwindcss/postcss`
- **Fonts**: Geist Sans & Geist Mono (from Vercel, optimized via `next/font`)
- **Dark Mode**: Supported via CSS variables and `prefers-color-scheme` media query

### Build & Development Tools

- **Linting**: ESLint 9.x with Next.js specific configs
  - Core web vitals rules
  - TypeScript support
- **Build Tool**: Next.js built-in bundler (Webpack)
- **Module System**: ES modules with TypeScript JSX support

### Development Dependencies

- `babel-plugin-react-compiler@1.0.0` - Enables React Compiler for automatic memoization
- TypeScript with strict type checking (`"strict": true`)
- Type definitions for Node.js, React, and React DOM

---

## Project Structure

```
credit-agent/
├── app/                          # Next.js App Router (main application code)
│   ├── page.tsx                  # Home page component (root route /)
│   ├── layout.tsx                # Root layout - wraps all pages with metadata & fonts
│   ├── globals.css               # Global styles, CSS variables, theme setup
│   └── favicon.ico               # Browser tab icon
│
├── public/                       # Static assets served directly
│   ├── next.svg, vercel.svg, etc # Example SVG assets
│   └── ...
│
├── docs/                         # Documentation
│   └── context.md                # This file - shared context for contributors
│
├── Configuration Files
│   ├── next.config.ts            # Next.js configuration (React Compiler enabled)
│   ├── tsconfig.json             # TypeScript configuration
│   ├── postcss.config.mjs         # PostCSS configuration (Tailwind)
│   ├── eslint.config.mjs          # ESLint configuration
│   └── package.json              # Dependencies and scripts
│
├── node_modules/                 # Installed dependencies (auto-generated)
├── .next/                        # Build output (auto-generated, gitignored)
└── next-env.d.ts                # Auto-generated Next.js TypeScript definitions
```

---

## High-Level Architecture

### File-Based Routing (Next.js App Router)

```
app/page.tsx → GET / (home page)
```

Currently, there's only the homepage. New routes can be added by creating files in the `app/` directory.

### Rendering Strategy

- **Server-Side Rendering (SSR)** by default for all components
- Metadata defined in `layout.tsx` applies to all pages
- CSS-in-JS via Tailwind CSS + global CSS variables

### Styling Architecture

```
globals.css (CSS variables + Tailwind imports)
    ↓
Tailwind CSS (post-processed)
    ↓
Browser-rendered styles with theme support
```

- Light theme: `--background: #ffffff`, `--foreground: #171717`
- Dark theme: `--background: #0a0a0a`, `--foreground: #ededed`
- Automatically switches based on `prefers-color-scheme` media query

---

## Key Concepts for First-Time Contributors

### 1. **App Router vs Pages Router**

This project uses the **App Router** (Next.js 13+), which uses:

- File system-based routing in the `app/` directory
- `layout.tsx` for shared layouts
- React Server Components by default
- **Not** the legacy `pages/` directory

### 2. **TypeScript Strict Mode**

All code must pass TypeScript strict mode checks:

- No implicit `any` types
- Null/undefined must be explicitly handled
- Strict property initialization

### 3. **Path Aliases**

Configured in `tsconfig.json`:

```typescript
"@/*": ["./*"]  // Can import from root: import x from "@/app/..."
```

### 4. **React Compiler**

Enabled in `next.config.ts`:

- Automatically memoizes components and values
- Optimizes performance without manual `React.memo()` or `useMemo()`
- Requires React 19+

### 5. **Tailwind CSS v4**

- Uses `@import "tailwindcss"` in CSS (new directive syntax)
- Supports dark mode via `dark:` prefix
- Responsive design via `sm:`, `md:`, `lg:`, etc.

### 6. **ESLint Configuration**

- Uses flat config format (ESLint 9)
- Enforces Next.js best practices and core web vitals
- TypeScript linting rules applied
- Run with: `npm run lint`

---

## Development Workflow

### Installation & Setup

```bash
npm install          # Install dependencies
npm run dev         # Start development server on http://localhost:3000
npm run build       # Create optimized production build
npm start           # Run production server
npm run lint        # Check code for linting issues
```

### Adding New Features

**Creating a new page:**

```typescript
// app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard Page</div>;
}
```

Automatically available at `/dashboard`

**Adding API routes:**

```typescript
// app/api/credits/route.ts
export async function GET(req: Request) {
  return Response.json({ credits: 100 });
}
```

Available at `/api/credits`

**Using server components (default):**

```typescript
// Executes on server only
export default async function MyComponent() {
  const data = await fetchFromDB();
  return <div>{data}</div>;
}
```

**Using client components:**

```typescript
"use client"; // Mark as client component

import { useState } from "react";

export default function MyComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## Important Notes

### Currently Incomplete

- **No backend logic** - This is a UI scaffold
- **No database** - Not yet integrated
- **No authentication** - Not implemented
- **No credit management logic** - Core functionality to be built
- **Placeholder content** - Homepage has default boilerplate text

### Next Steps for Development

1. Define the credit agent's purpose and requirements
2. Plan API structure and data models
3. Implement backend endpoints (`app/api/`)
4. Create main agent interface/UI components
5. Add state management if needed (React Context, external library)
6. Implement authentication if required
7. Connect to database/backend services

### Best Practices to Follow

- ✅ Use TypeScript for all new code
- ✅ Leverage React Server Components by default (faster, more secure)
- ✅ Use Tailwind CSS for styling (avoid inline styles)
- ✅ Keep components small and focused
- ✅ Add `'use client'` only when interactivity is needed
- ✅ Run `npm run lint` before committing
- ✅ Follow Next.js recommendations in official docs

### Common Commands

| Command         | Purpose                            |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start dev server (with hot reload) |
| `npm run build` | Create production build            |
| `npm run lint`  | Check for code issues              |
| `npm start`     | Run production build               |

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React 19 Docs**: https://react.dev

---

## Git & Version Control

**Current Status**: Branch is behind `origin/main` by 3 commits (run `git pull` to sync)

When contributing:

1. Keep commits focused and well-described
2. Test locally before pushing
3. Follow the project's TypeScript strict mode rules
4. Update this context document if adding new architectural patterns
