# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**tan-re-receipts** is a full-stack insurance claim and receipt management web application built with Next.js 15 and React 18. The application handles claims registration, payment processing, receipt management, dashboards with risk visualization, and administrative operations.

## Quick Commands

### Development
```bash
npm run dev      # Start dev server with Turbopack (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Key Development Notes
- Uses **pnpm** for package management (pnpm-lock.yaml)
- Runs on **Turbopack** in development for fast rebuilds
- TypeScript with strict mode enabled
- Path aliases: `@/*` maps to `./src/*`
- No test framework currently configured

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.3 with App Router
- **UI Library**: React 18.3 with Mantine 7.17 component library
- **Styling**: Tailwind CSS 4 + PostCSS
- **State Management**: Zustand 5.0 (per-feature stores)
- **Auth**: JWT token-based (localStorage, context-based)
- **HTTP**: Axios via custom `apiFetch` utility function
- **Data Viz**: Recharts, Leaflet, react-simple-maps
- **Date Handling**: DayJS
- **Icons**: Tabler Icons React

### Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Route group for authenticated pages
│   │   ├── claims/        # Claims registration & management
│   │   ├── claims-payment/ # Payment processing
│   │   ├── dashboard/     # Analytics & risk distribution
│   │   ├── finance/       # Payment vouchers & cashier
│   │   ├── receipts/      # Receipt search & management
│   │   ├── reports/       # Reporting (premium registers, etc.)
│   │   ├── admin/         # User & role management
│   │   ├── rms/           # Risk Management System
│   │   ├── travel/        # Travel request workflow
│   │   ├── debit-upload/  # Bulk debit file uploads
│   │   └── office-store/  # Inventory management
│   └── login/             # Public login page
│
├── components/            # Reusable React components (39 files)
│   ├── admin/            # User/role management UIs
│   ├── claims/           # Claims-specific components
│   ├── dashboard/        # Dashboard visualizations
│   ├── receipts/         # Receipt search/display
│   └── ...              # Other feature components
│
├── store/               # Zustand state management
│   ├── useClaimRegisterStore.ts
│   ├── useClaimPaymentStore.ts
│   ├── useDashboardStore.ts
│   ├── useFinanceRequestStore.ts
│   ├── useOfferAnalysisStore.ts
│   ├── useOfficeStoreInventory.ts
│   └── useReportStore.ts
│
├── service/             # API service layer
│   ├── auth.ts
│   └── debit-upload.ts
│
├── config/              # Configuration
│   └── api.ts          # API endpoint & apiFetch utility
│
├── context/             # React context providers
│   └── AuthContext.tsx
│
├── hooks/               # Custom React hooks
│   └── useAdminAuth.ts
│
└── utils/               # Utility functions
    └── format.ts       # Formatting helpers
```

### Core Architecture Patterns

#### Authentication Flow
1. Login page (`app/login/page.tsx`) accepts credentials
2. Auth service (`service/auth.ts`) handles token exchange
3. JWT token stored in localStorage
4. `AuthContext` manages user state
5. Root layout checks for valid token; redirects to login if missing
6. Admin auth via `useAdminAuth` hook for role validation

#### API Communication
- **Entry point**: `src/config/api.ts` exports `apiFetch` function
- Automatically injects JWT token in `Authorization` header
- Supports JSON and FormData payloads
- Handles session expiration (401/403 redirects to login)
- Also uses Axios directly in some places

#### State Management Pattern
- Each major feature has a dedicated Zustand store
- Stores handle async operations and data caching
- Example: `useClaimRegisterStore` manages claim registration state
- Stores are imported directly in components (no provider pattern needed)

#### UI Component Hierarchy
- Mantine provides base components (@mantine/core, @mantine/modals, @mantine/notifications)
- Custom components in `src/components/` extend Mantine UI
- Tailwind classes applied for additional styling
- Form management via `@mantine/form` integrated with Zustand stores

### Environment Configuration
- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL
- `NEXT_PUBLIC_API_DOC_URL` - API documentation URL
- Local: `.env.local`
- Production: `.env.production`
- See `.env.example` for all available variables

## Important Development Guidelines

### When Working with API Calls
- Use the `apiFetch` function from `src/config/api.ts` for consistency
- It automatically handles authentication tokens and error responses
- Returns JSON by default; specify `responseType: 'blob'` for file downloads

### When Working with Forms
- Use `@mantine/form` hooks integrated with Zustand stores
- Components: `TextInput`, `Select`, `Checkbox`, `Button` from `@mantine/core`
- Validation happens in store actions before API calls

### When Working with Modals & Notifications
- Use `@mantine/modals` for dialogs
- Use `@mantine/notifications` for toasts
- Both are pre-configured in root layout with Mantine provider

### Current Git Context
- **Branch**: `claim-register` (active development on claims features)
- **Main branch**: `main`
- Recent focus: Dashboard optimization, claims search, performance improvements

### Feature Areas & Key Files

| Feature | Key Files | Zustand Store |
|---------|-----------|----------------|
| Claims Registration | `app/(app)/(claims)/claims/page.tsx`, `components/claims/` | `useClaimRegisterStore` |
| Claim Payments | `app/(app)/(claims)/claims-payment/`, `components/claims/` | `useClaimPaymentStore` |
| Dashboard | `app/(app)/dashboard/page.tsx`, `components/dashboard/` | `useDashboardStore` |
| Receipts | `app/(app)/receipts/page.tsx`, `components/receipts/` | (direct API calls) |
| Finance | `app/(app)/finance/cashier/`, `components/` | `useFinanceRequestStore` |
| Admin | `app/(app)/admin/page.tsx`, `components/admin/` | (localStorage + API) |
| Reports | `app/(app)/reports/`, `components/` | `useReportStore` |
