# NexviaTech Frontend (Next.js App Router)

Production-style agency website built with Next.js + TypeScript, powered by text files in `public/data/*`.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

## Run Locally

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Build

```bash
npm run build
npm start
```

## Data-Driven Content

Most homepage/project/team content is loaded from `public/data`.

### 1) Projects

- Card list/order: `public/data/cards/projects.txt`
- Full details (modal): `public/data/cards/projectdetails.txt`
- Category list/order: `public/data/projects/category.txt`

Rules:

- Separate each block with a blank line.
- Use unique `id` for each project.
- Use `category:` (recommended). `type:` is optional and falls back to `category`.
- If a project `id` is missing in `projectdetails.txt`, modal uses fallback text.

### 2) Team

- Team source: `public/data/team/team.txt`
- Images: `public/team/images/{id}.{ext}`

Supported image extensions:

- `.png`
- `.jpg`
- `.jpeg`
- `.webp`
- `.avif`
- `.svg`

Example:

- `id: umesh-sharma` -> `public/team/images/umesh-sharma.png`

### 3) Expertise (Solutions Overview)

- Source: `public/data/experties/experties.txt`

Each block supports:

- `id`
- `icon`
- `title`
- `description`

### 4) Testimonials

- Source: `public/data/testnomial/testimonials.txt`

## Logos (Trusted By Global Teams)

- Source folder: `public/logo`
- Loaded dynamically via `app/api/logos/route.ts`
- Section shows exactly how many logos exist in `public/logo`

## Project Screenshots

- Source folder: `public/cards/*`
- Loaded dynamically via `app/api/card-images/route.ts`
- Missing files auto-fallback to available images, then placeholder

## Legal Pages

- Privacy Policy route: `/privacy-policy`
- Terms route: `/terms-of-service`
- PDF files in `public/`:
  - `NexviaTech_Privacy_Policy.pdf`
  - `NexviaTech_Terms_of_Service.pdf`

## Important Notes

- Content updates from `public/data` are fetched with `no-store` + cache-busting timestamp.
- UI also polls periodically and refreshes on window focus.
- If you still see stale data, do hard refresh: `Ctrl + F5`.

## Key Paths

- Home page: `app/page.tsx`
- Projects page: `app/projects/page.tsx`
- Portfolio component: `app/components/Portfolio.tsx`
- Team section: `app/components/ProcessTeamFaqSection.tsx`
- Services section: `app/components/Services.tsx`
- Footer: `app/components/Footer.tsx`

