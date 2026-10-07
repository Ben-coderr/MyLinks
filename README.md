# MyLinks 🔗

> **The modern, open-source, high-performance link-in-bio platform.**  
> Built with Next.js 16 (App Router), Prisma ORM, PostgreSQL, NextAuth.js v5 (Auth.js), Tailwind CSS, Framer Motion, and DnD Kit.

---

## 🌟 Key Features

### 👤 Profile Customization & Dynamic Themes
- **Unique Username Handles**: Claim custom handles like `mylinks.com/username` with instant availability validation.
- **Multiple Curated Themes**: Switch instantly between sleek dark, cyberpunk neon, midnight minimal, luxury gold, pastel, and retro terminal palettes.
- **Social Links Integration**: Embed icons and direct links for GitHub, Twitter/X, LinkedIn, YouTube, Instagram, and more.
- **QR Code Generator**: Generate crisp downloadable QR codes for rapid sharing across events, business cards, and social media.

### ⚡ Interactive Dashboard & Live Preview
- **Drag-and-Drop Reordering**: Rearrange links seamlessly with smooth `@dnd-kit` touch and mouse drag-and-drop interactions.
- **Real-Time Mobile Device Mockup**: Preview changes live inside an animated smartphone frame before saving.
- **Link Toggle & Scheduling**: Instantly enable, disable, edit, or delete links with optimistic UI updates.

### 📊 Real-Time Analytics & Click Tracking
- **Click Redirection & Tracking**: High-throughput `/api/click/[linkId]` redirection route logging user agent, referer, and timestamps.
- **Performance Metrics**: Monitor total profile impressions, link clicks, top-performing links, and click-through rates (CTR).

### 🛡️ Enterprise Security & Admin Portal
- **Auth.js v5 (NextAuth)**: Secure credentials-based authentication with bcrypt-hashed passwords and extensible OAuth (Google/GitHub).
- **Role-Based Access Control**: Strict `USER` and `ADMIN` separation enforced at both middleware and server-action layers.
- **Admin Moderation Panel**: Manage all registered users, toggle account statuses (ACTIVE, SUSPENDED, PENDING), and review platform metrics.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/) |
| **Authentication** | [Auth.js v5](https://authjs.dev/) (`next-auth@beta`) & [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) |
| **Styling & Animation** | [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) |
| **Interactions** | [@dnd-kit/core](https://dndkit.com/) & [Lucide React](https://lucide.dev/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |

---

## 📂 Project Structure

```text
├── actions/             # Next.js Server Actions (links, profiles, admin, auth)
├── app/                 # Next.js App Router
│   ├── (auth)/login/    # User authentication & sign-in
│   ├── (auth)/register/ # New user onboarding
│   ├── [username]/      # Public link-in-bio profile pages
│   ├── admin/           # Administrative moderation dashboard
│   ├── api/             # REST endpoints (click tracking, username checks)
│   ├── dashboard/       # User management center & live preview
│   ├── globals.css      # Core styles & design tokens
│   ├── layout.tsx       # Root layout & providers
│   ├── robots.ts        # Search engine crawler configuration
│   └── sitemap.ts       # Dynamic XML sitemap generator
├── components/          # Reusable UI components
│   ├── admin/           # Admin table and statistics widgets
│   ├── analytics/       # Chart and click metric components
│   ├── dashboard/       # Link builder, theme picker, phone preview
│   ├── profile/         # Public profile view & link buttons
│   └── ui/              # Button, Modal, Card, Input primitives
├── lib/                 # Shared utilities, Prisma client, and auth helpers
├── prisma/              # Prisma schema definition & database seed script
├── types/               # TypeScript interfaces & domain models
└── public/              # Static assets & SVG icons
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **PostgreSQL**: Local instance or hosted provider (Supabase, Neon, Railway)
- **npm** or **pnpm**

### 2. Clone Repository
```bash
git clone https://github.com/Ben-coderr/MyLinks.git
cd MyLinks
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` into `.env`:
```bash
cp .env.example .env
```

Fill in your configuration:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/mylinks"

# NextAuth / Auth.js
AUTH_SECRET="your-generate-auth-secret-here-minimum-32-chars"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Admin Setup
ADMIN_EMAIL="admin@mylinks.com"
```

> **Tip**: Generate an `AUTH_SECRET` by running:  
> `openssl rand -base64 32` or `npx auth secret`

### 5. Setup Database & Seed Initial Data
```bash
# Push schema to database
npx prisma db push

# (Optional) Seed demo users, links, and themes
npx prisma db seed
```

### 6. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Default Test Accounts (After Seeding)

| Account | Email | Password | Role | Handle |
|---|---|---|---|---|
| **Admin** | `admin@mylinks.com` | `admin123` | `ADMIN` | `/admin` |
| **Creator** | `demo@mylinks.com` | `demo123` | `USER` | `/demo` |

---

## 🌿 Git Branching Strategy & Workflow

This repository adheres to the **GitFlow** branching model:

- `main` — Production-ready code, highly stable releases.
- `develop` — Active integration branch for upcoming features.
- `feat/*` — Dedicated feature branches (e.g. `feat/auth-system`, `feat/dashboard-builder`).
- `fix/*` — Bug fixes.
- `chore/*` — Tooling, configuration, and documentation updates.

### Commit Conventions
Commits strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` A new user-facing feature
- `fix:` A bug fix
- `docs:` Documentation updates
- `style:` Code style, formatting, CSS adjustments
- `refactor:` Code refactoring without behavioral change
- `chore:` Configuration, dependencies, or maintenance tasks

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
