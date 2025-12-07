# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 application with TypeScript, Tailwind CSS v4, and Prisma ORM setup for PostgreSQL. Uses shadcn/ui component library with "new-york" style variant. Includes Better Auth for authentication and a code generator system for CRUD admin interfaces.

## Development Commands

```bash
# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Generate admin-v2 services and actions from model configs
npm run generate:admin-v2
```

## Database Setup

PostgreSQL database runs in Docker:

```bash
# Start database and pgAdmin
cd database_prisma
docker-compose up -d

# Database connection details are in database_prisma/docker-compose.yaml
# - Host: localhost:5434
# - Database: starter-claude

# pgAdmin access: http://localhost:8882

# Prisma commands (from project root)
npx prisma migrate dev        # Create and apply migrations
npx prisma generate           # Generate Prisma client
npx prisma studio             # Open Prisma Studio GUI
```

Prisma schema location: `prisma/schema.prisma`

## Architecture

### Authentication (Better Auth)

**Server-side Auth:**
- Main auth configuration in `lib/auth.ts`
- Uses Prisma adapter with Better Auth
- Email/password authentication enabled (8 char minimum)
- Social providers: GitHub and Google (credentials via env vars)
- Session expiry: 7 days
- Additional user fields: `role` (default: "user"), `isActive` (default: true)
- Password reset emails sent via `lib/email.ts`

**Client-side Auth:**
- Client configuration in `lib/auth-client.ts`
- Exports: `signIn`, `signUp`, `signOut`, `useSession`, `requestPasswordReset`, `resetPassword`
- Usage: Import from `@/lib/auth-client` in client components

**Auth API:**
- Route handler: `app/api/auth/[...all]/route.ts` (handles all Better Auth endpoints)

**Middleware Protection:**
- `/admin-v2`: Requires authenticated user with `role === "admin"`
- `/profile`: Requires authenticated user (any role)
- `/sign-in` and `/sign-up`: Redirects authenticated users to `/admin-v2`

### Database (Prisma + PostgreSQL)

**Prisma Client Setup:**
- Singleton instance in `lib/prisma.ts`
- Uses `@prisma/adapter-pg` with native PostgreSQL driver (`pg`)
- Connection pooling via `pg.Pool`
- Global singleton pattern for development hot-reload support

**Schema Models:**
- `User`: Authentication + custom fields (role, isActive)
- `Post`: Blog posts with author relation and many-to-many categories
- `Category`: Post categories with color, sort order, visibility
- `PostCategory`: Join table for Post-Category many-to-many
- `Session`, `Account`, `Verification`: Better Auth tables

### Admin System

**Purpose:** Automated CRUD admin interface with generated services and server actions from model configurations.

**Configuration Files:**
- `scripts/models-config.js`: Defines models for generation (User, Post, Category)
- `models/*.config.ts`: Per-model UI configurations for admin interfaces (fields, validation, display settings)

**Generation Process:**
1. Define model in `scripts/models-config.js` with:
   - Model name, ID type, search fields, relations (many-to-one, many-to-many)
2. Run `npm run generate:admin-v2`
3. Generates:
   - Service layer: `lib/admin-v2/services/[model].service.ts` (database operations)
   - Server actions: `actions/v2/[model].actions.ts` (used in client components)

**Templates:**
- Located in `scripts/generators/templates/`
- Placeholders like `[MODEL]`, `[ENTITY]`, `[ID_TYPE]` replaced during generation

**Admin Routes:**
- `/admin-v2` - Dashboard
- `/admin-v2/[entity]` - List view (uses DataTable with search, pagination)
- `/admin-v2/[entity]/new` - Create form
- `/admin-v2/[entity]/[id]/edit` - Edit form

**How Admin Works:**
- Dynamic routes use entity name from URL (e.g., `/admin-v2/user`)
- Uses server actions from `actions/v2/` for all CRUD operations
- Actions mapped in `app/admin-v2/[entity]/page.tsx` via `actionsMap`
- Model configurations in `models/` directory define UI behavior
- Config retrieved via `getModelConfig(entity)` from `lib/admin/config.ts`
- Relation fields use server actions from `lib/admin-v2/actions/relation-options.ts`

### UI Components (shadcn/ui)

**Configuration:**
- Style: new-york variant
- Base color: neutral
- CSS variables enabled for theming
- Icons: Lucide React
- React Server Components enabled

**Component Locations:**
- `components/ui/` - Base shadcn/ui components
- `components/admin/` - Admin-specific components (DataTable, DataTableToolbar, etc.)
- `components/auth/` - Authentication forms and components

**Styling Utilities:**
- `lib/utils.ts` exports `cn()` function for merging Tailwind classes
- Uses `clsx` + `tailwind-merge`

**Fonts:**
- Geist Sans and Geist Mono via next/font
- CSS variables: `--font-geist-sans`, `--font-geist-mono`

### Path Aliases

```typescript
"@/*" => "./*"  // Maps to project root
```

### Key Dependencies

**Auth:** Better Auth 1.4.3 with Prisma adapter
**Database:** Prisma 7.0.0 with PostgreSQL adapter, pg driver
**Forms:** react-hook-form with Zod validation
**Tables:** @tanstack/react-table
**Email:** nodemailer

## Project Structure

```
app/
├── (auth)/          # Auth pages (sign-in, sign-up) with layout
├── admin-v2/        # Admin interface with generated CRUD routes
│   ├── [entity]/    # Dynamic entity routes (list, new, edit)
│   ├── layout.tsx
│   └── page.tsx
├── api/
│   └── auth/        # Better Auth API handler
├── profile/         # User profile pages
└── layout.tsx       # Root layout

lib/
├── admin/           # Admin config and types (shared)
│   ├── config.ts    # Model configuration registry
│   ├── types.ts     # Type definitions for admin system
│   └── schema-generator.ts  # Zod schema generation from config
├── admin-v2/
│   ├── actions/     # Action helpers (relation options)
│   ├── services/    # Generated database services
│   └── types/       # Service/action type definitions
├── auth.ts          # Better Auth server config
├── auth-client.ts   # Better Auth client exports
├── prisma.ts        # Prisma client singleton
└── utils.ts         # Tailwind merge utility

actions/
└── v2/              # Generated server actions

scripts/
├── generators/
│   ├── templates/   # Code generation templates
│   └── generate-all.js  # Main generator script
└── models-config.js # Model definitions for generator

models/              # Admin UI model configurations
components/
├── ui/              # shadcn/ui components
├── admin/           # Admin components (DataTable, forms, etc.)
└── auth/            # Authentication forms and components

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Migration history
```

## Adding New Admin Entities

1. Add model to `prisma/schema.prisma`
2. Run `npx prisma migrate dev` to create migration
3. Add model config to `scripts/models-config.js`
4. Create UI config in `models/[model].config.ts`
5. Run `npm run generate:admin-v2` to generate service and actions
6. Add actions to `actionsMap` in `app/admin-v2/[entity]/page.tsx`
7. Update `lib/admin/config.ts` to include new model config
