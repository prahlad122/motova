# Motova

Motova is a modern web platform with a responsive Next.js frontend and a modular Node.js/Express backend. The frontend includes a marketing/landing website, authentication pages, reusable UI components, and dashboard components for authenticated users.

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next/Image
- React Hooks
- ESLint

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT-based authentication utilities
- bcryptjs
- CORS
- Cookie Parser

---

## Project Structure

```text
motova/
│
├── frontend/
│   ├── public/
│   │   └── images/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   ├── login/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardToolbar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   │
│   │   │   └── landing/
│   │   │       ├── CTA.tsx
│   │   │       ├── FAQ.tsx
│   │   │       ├── Features.tsx
│   │   │       ├── Footer.tsx
│   │   │       ├── Hero.tsx
│   │   │       ├── Metrics.tsx
│   │   │       ├── Navbar.tsx
│   │   │       ├── Services.tsx
│   │   │       └── Testimonials.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Icon.tsx
│   │   │   └── Input.tsx
│   │   │
│   │   ├── features/
│   │   │   └── auth/
│   │   │       ├── components/
│   │   │       │   ├── AuthPageLayout.tsx
│   │   │       │   ├── LoginForm.tsx
│   │   │       │   └── VendorRegisterForm.tsx
│   │   │       ├── auth.api.ts
│   │   │       ├── auth.types.ts
│   │   │       └── auth.utils.ts
│   │   │
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   │
│   ├── .env
│   ├── .env.local
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── generated/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── admins/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.validation.ts
│   │   │   └── vendors/
│   │   ├── routes/
│   │   │   ├── health.routes.ts
│   │   │   └── index.ts
│   │   └── utils/
│   ├── .env
│   └── .gitignore
│
└── .vercel/
```

> `node_modules`, `.next`, `dist`, generated files, and environment files should not be committed to the repository unless your project specifically requires them.

---

# Frontend

The frontend is built with Next.js and TypeScript. It follows a component-based structure where landing-page sections, dashboard components, authentication features, and reusable UI components are separated.

## Frontend Architecture

```text
src/
├── app/
├── components/
├── ui/
├── features/
├── hooks/
├── lib/
└── types/
```

### `app/`

Contains Next.js application routes and global application configuration.

```text
app/
├── (dashboard)/
├── login/
├── globals.css
├── layout.tsx
└── page.tsx
```

### `components/landing/`

Contains the components used to build the public Motova website.

```text
landing/
├── CTA.tsx
├── FAQ.tsx
├── Features.tsx
├── Footer.tsx
├── Hero.tsx
├── Metrics.tsx
├── Navbar.tsx
├── Services.tsx
└── Testimonials.tsx
```

Responsibilities include:

- Hero section
- Navigation
- Product/service presentation
- Metrics
- Features
- Testimonials
- FAQ
- Call-to-action
- Footer

### `components/dashboard/`

Contains reusable dashboard layout components.

```text
dashboard/
├── DashboardToolbar.tsx
├── Navbar.tsx
└── Sidebar.tsx
```

These components provide the common dashboard interface such as navigation, sidebar controls, and dashboard toolbar elements.

### `ui/`

Contains reusable low-level UI components.

```text
ui/
├── Button.tsx
├── Icon.tsx
└── Input.tsx
```

These components are intended to be reused across multiple pages instead of duplicating UI code.

### `features/auth/`

Authentication-specific functionality is isolated inside the auth feature.

```text
features/auth/
├── components/
│   ├── AuthPageLayout.tsx
│   ├── LoginForm.tsx
│   └── VendorRegisterForm.tsx
├── auth.api.ts
├── auth.types.ts
└── auth.utils.ts
```

Responsibilities:

- Authentication UI
- Login form
- Vendor registration
- Authentication API calls
- Authentication types
- Authentication utility functions

This keeps authentication logic separate from generic UI components.

### `hooks/`

Contains reusable React hooks.

### `lib/`

Contains shared frontend utilities and application-level helper modules.

### `types/`

Contains shared TypeScript type definitions.

---

# Landing Page

The landing page is composed of independent sections:

```text
Navbar
Hero
Metrics
Features
Services
Testimonials
FAQ
CTA
Footer
```

This structure makes each section independently maintainable and reusable.

## Testimonials

The testimonials section supports a responsive carousel.

Expected responsive behavior:

```text
Mobile   → 1 testimonial card
Tablet   → 2 testimonial cards
Desktop  → 4 testimonial cards
```

The carousel can be configured for automatic movement and manual navigation while keeping each testimonial card inside the carousel viewport.

---

# Authentication

Authentication is organized under:

```text
src/features/auth/
```

The main files are:

```text
auth.api.ts
auth.types.ts
auth.utils.ts
```

Authentication UI is located in:

```text
src/features/auth/components/
```

with:

```text
AuthPageLayout.tsx
LoginForm.tsx
VendorRegisterForm.tsx
```

The application separates authentication API calls, types, utilities, and UI components so that changes to authentication logic do not require rewriting the page layout.

---

# Backend

The backend follows a modular Express architecture.

```text
src/
├── config/
├── generated/
├── middleware/
├── modules/
├── routes/
└── utils/
```

## Backend Modules

```text
modules/
├── admins/
├── auth/
└── vendors/
```

Each domain can contain its own controllers, services, routes, validations, and supporting logic.

## Authentication Module

The authentication module contains:

```text
auth/
├── auth.controller.ts
├── auth.routes.ts
├── auth.service.ts
└── auth.validation.ts
```

### Controller

Handles incoming HTTP requests and sends responses.

### Routes

Defines authentication endpoints and connects them to controllers.

### Service

Contains authentication business logic.

### Validation

Contains request validation rules.

This separation keeps HTTP handling, business logic, routing, and validation independent.

---

# Backend Routes

The backend has a centralized route structure:

```text
routes/
├── health.routes.ts
└── index.ts
```

`health.routes.ts` provides health-check functionality.

`index.ts` acts as the central route registration point.

---

# Database

Motova uses PostgreSQL with Prisma ORM.

Prisma-related files are maintained under:

```text
backend/prisma/
```

The generated Prisma client/code is kept under:

```text
backend/src/generated/
```

Database configuration should be supplied through environment variables rather than hard-coded in source files.

---

# Environment Variables

## Frontend

Create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

For production:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
```

## Backend

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=your_postgresql_connection_string
FRONTEND_URL=http://localhost:3000
PORT=5000
```

Production example:

```env
DATABASE_URL=your_production_postgresql_connection_string
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

Never commit real credentials, database URLs, JWT secrets, or other sensitive values.

---

# Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
cd motova
```

## 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## 3. Start the Frontend

```bash
npm run dev
```

The Next.js development server normally runs at:

```text
http://localhost:3000
```

## 4. Install Backend Dependencies

Open another terminal:

```bash
cd backend
npm install
```

## 5. Start the Backend

Run the backend development command defined in `backend/package.json`.

The API is expected to run locally on the configured backend port, for example:

```text
http://localhost:5000
```

---

# Prisma Commands

From the `backend` directory:

Generate Prisma Client:

```bash
npx prisma generate
```

Check migration status:

```bash
npx prisma migrate status
```

Create a migration during development:

```bash
npx prisma migrate dev --name migration_name
```

Apply migrations:

```bash
npx prisma migrate deploy
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

# Development Workflow

A typical development workflow is:

```text
Pull latest code
      ↓
Create feature branch
      ↓
Implement feature
      ↓
Test locally
      ↓
Check responsive design
      ↓
Run lint/build
      ↓
Commit changes
      ↓
Push branch
      ↓
Create Pull Request
```

Example:

```bash
git checkout main
git pull origin main
git checkout -b feat/update-testimonials
```

After making changes:

```bash
git status
git add .
git commit -m "feat: update testimonials carousel"
git push -u origin feat/update-testimonials
```

---

# Responsive Design

The frontend is designed for multiple screen sizes.

Tailwind responsive breakpoints are used to adjust:

- Layout
- Typography
- Navigation
- Cards
- Images
- Dashboard components
- Carousel behavior
- Spacing

Always test changes on:

```text
Mobile
Tablet
Desktop
Large Desktop
```

---

# Code Organization Principles

## Components

Keep reusable UI components separate from page-specific logic.

## Features

Keep domain-specific functionality inside the appropriate feature folder.

## UI

Use reusable primitive components such as:

```text
Button
Input
Icon
```

instead of duplicating the same styles throughout the application.

## API

Keep frontend API communication inside feature-specific API files.

For example:

```text
features/auth/auth.api.ts
```

## Types

Keep reusable TypeScript definitions in the appropriate `types` or feature type files.

## Backend Modules

Keep backend business logic organized by domain:

```text
admins
auth
vendors
```

---

# Deployment

## Frontend

The Next.js frontend can be deployed using Vercel or another platform supporting Next.js.

Configure the production API URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
```

## Backend

Deploy the Node.js/Express backend to a Node-compatible hosting platform.

Configure:

```env
DATABASE_URL=your-production-database-url
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

Make sure the backend CORS configuration allows the deployed frontend origin.

---

# Troubleshooting

## Frontend Cannot Connect to Backend

Check:

```env
NEXT_PUBLIC_API_URL
```

and make sure the backend is running.

Also verify that the backend allows the frontend origin through CORS.

## Prisma Database Errors

Verify:

```env
DATABASE_URL
```

Then run:

```bash
npx prisma generate
npx prisma migrate status
```

Apply required migrations when appropriate:

```bash
npx prisma migrate deploy
```

## Port Already in Use

If the frontend port is already occupied, run the application on another port.

For example:

```bash
npm run dev -- -p 3001
```

---

# Git Branch Naming

Recommended branch naming:

```text
feat/feature-name
fix/bug-name
refactor/component-name
chore/task-name
```

Examples:

```text
feat/update-testimonials
feat/vendor-registration
fix/navbar-alignment
fix/carousel-overflow
refactor/auth-module
chore/update-dependencies
```

---

# Commit Message Examples

```text
feat: add vendor registration
feat: update testimonials carousel
fix: resolve testimonial card overflow
fix: align navbar login button
refactor: organize authentication components
style: improve responsive landing page
chore: update dependencies
```

---

# Security

- Do not commit `.env` or `.env.local` files containing secrets.
- Do not expose database credentials in frontend code.
- Validate authentication requests on the backend.
- Hash passwords before storing them.
- Use secure authentication/session handling in production.
- Configure CORS for trusted frontend origins.
- Keep dependencies updated.
- Do not expose internal backend errors directly to users.

---

# License

This project is proprietary software.

Copyright © 2026 Motova. All rights reserved.
