# Database Seeds

This directory contains seed files for populating the database with sample data.

## Running Seeds

To run all seeds in the correct order:

```bash
npm run db:seed
```

## Seed Files

### 1. core-data.ts

Seeds core application data including users, blog posts, galleries, and contact submissions.

**What gets seeded:**
- **Users (2)**:
  - Admin: `admin@example.com` / `admin123`
  - User: `user@example.com` / `user123`

- **Blog Categories (4)**:
  - Technology (#3B82F6)
  - Running (#10B981)
  - Events (#F59E0B)
  - Tips & Tricks (#8B5CF6)

- **Blog Posts (4)**:
  - Getting Started with Running (published)
  - Top 10 Running Events in Slovakia 2025 (published)
  - Building a Running Event Website with Next.js (published)
  - Training for Your First Half Marathon (draft)

- **Galleries (2)**:
  - Bratislava Marathon 2024 Highlights (3 images)
  - Trail Running in High Tatras (2 images)

- **Contact Submissions (3)**:
  - Event registration question (new)
  - Sponsorship inquiry (new)
  - Results question (read)

### 2. slovak-geography.ts

Seeds all Slovak regions and districts. This is **required** before running the events seed.

**What gets seeded:**
- **8 Regions**: Bratislavský, Trnavský, Trenčiansky, Nitriansky, Žilinský, Banskobystrický, Prešovský, Košický
- **79 Districts**: All Slovak districts organized by region

Uses `upsert` to avoid duplicates, so it's safe to run multiple times.

### 3. sample-events.ts

Seeds sample running events with full data structure. **Depends on slovak-geography.ts**.

**What gets seeded:**
- **Organizers (2)**:
  - Bratislava Running Club
  - Slovak Marathon Association

- **Locations (2)**:
  - Sad Janka Kráľa (Bratislava)
  - Tehelné pole Stadium (Bratislava)

- **Partners (2)**:
  - SportRun Slovakia
  - Energy Plus

- **Events (2)**:
  - Bratislava Spring Marathon 2025 (Apr 12, 2025)
  - City Park Run 2025 (May 10, 2025)

- **Runs (5)**:
  - Full Marathon (42.195 km)
  - Half Marathon (21.0975 km)
  - 10K Race (Spring Marathon)
  - 5K Fun Run (Park Run)
  - 10K Race (Park Run)

- **Run Categories**: Standard age/gender categories for each run
- **Entry Fees**: Multiple pricing tiers (Early Bird, Regular, Late)
- **Event Schedule**: Detailed schedule for Spring Marathon
- **Runners (2)**: Sample runner profiles
- **Registrations (3)**: 2 confirmed paid + 1 pending

## Seed Order

Seeds run in this order:

1. **core-data** - Users and blog content (no dependencies)
2. **slovak-geography** - Regions and districts (required by events)
3. **sample-events** - Events, runs, registrations (depends on geography)

## Running Individual Seeds

You can run individual seed files directly:

```bash
# Core data only
npx tsx prisma/seeds/core-data.ts

# Slovak geography only
npx tsx prisma/seeds/slovak-geography.ts

# Sample events only (requires geography to be seeded first)
npx tsx prisma/seeds/sample-events.ts
```

## Re-running Seeds

- **core-data.ts**: Deletes existing core data before re-seeding
- **slovak-geography.ts**: Uses upsert, safe to run multiple times
- **sample-events.ts**: May create duplicates if run multiple times

To completely reset the database:

```bash
npx prisma migrate reset
npm run db:seed
```

## Login Credentials

After seeding, you can log in with:

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## Notes

- All dates are set for 2025 events
- Sample data uses Slovak-specific geography and naming
- Events are set to "published" status by default
- Image paths reference `/images/` directory (images not included)
