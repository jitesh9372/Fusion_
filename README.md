# FUSION

> **"Skills. Services. Stronger Communities."**

A modern cooperative service marketplace connecting customers, skilled workers, and cooperative managers.

---

## 📌 Current Module: Authentication Module

This repository contains the standalone, fully modular **Authentication Module** for FUSION.

### What is Included:
- **Frontend**: React 18 + Vite + TypeScript (strict) + Tailwind CSS + Framer Motion + Lucide React + Supabase JS Client + Zod + React Hook Form.
- **Backend**: Node.js + Express + TypeScript + Supabase Admin SDK + Helmet + CORS.
- **3D Visual Experience**: Pure CSS 3D transforms (`perspective`, `rotateX/Y/Z`, `translateZ`) + Framer Motion spring physics + glowing abstract "Fusion Core" + floating glassmorphic Customer/Worker/Cooperative cards + mouse parallax + drift particles. **(Zero Three.js / Spline dependency for high-performance 60fps).**
- **Auth Routes**:
  - `/auth` &rarr; Redirects to `/auth/signin`
  - `/auth/signin` &rarr; Sign In with Email/Password & Google OAuth
  - `/auth/signup` &rarr; Sign Up with live password strength meter & Google OAuth
  - `/auth/forgot-password` &rarr; Password reset request with animated confirmation
  - `/auth/reset-password` &rarr; New password update form
  - `/auth/verify-email` &rarr; Check inbox screen with 30s resend countdown
  - `/auth/callback` &rarr; OAuth redirect handler
- **Routing & Guards**:
  - `ProtectedRoute` &rarr; Guards authenticated pages (redirects unauthenticated to `/auth/signin`)
  - `PublicOnlyRoute` &rarr; Guards auth pages from already logged-in sessions
  - `AnimatePresence` &rarr; Smooth cross-fade and slide page transitions
- **Centralized Design System**:
  - `siteConfig.ts` &rarr; Site branding, titles, taglines
  - `themeConfig.ts` &rarr; Color palette, typography tokens, surface colors
  - `authConfig.ts` &rarr; Feature flags (Google auth, email verification, cooldowns)
  - `motionConfig.ts` &rarr; Unified easing curves, springs, durations, and Framer Motion variants
- **Database & RLS**:
  - `supabase/schema.sql` &rarr; Profiles table with `customer`, `worker`, `admin` roles, Row Level Security (RLS) policies, and automated user trigger.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm or yarn
- A [Supabase](https://supabase.com) project

---

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy environment variables
cp .env.example .env
```

Edit `frontend/.env` with your Supabase anonymous keys:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001
```

Start the frontend Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 4. Supabase Database Migration

1. Open your Supabase Dashboard &rarr; **SQL Editor**.
2. Copy and execute the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. This creates the `profiles` table, sets up RLS security policies, and configures an automatic trigger on `auth.users`.

---

## 📂 Architecture & Directory Structure

```
Fusion/
│
├── frontend/
│   ├── src/
│   │   ├── animations/     # motionConfig.ts (Easing, springs, variants)
│   │   ├── components/
│   │   │   ├── auth/       # FusionCore, FloatingCard, AuthLayout, Forms, etc.
│   │   │   └── common/     # Logo.tsx (reusable branding component)
│   │   ├── config/         # siteConfig, themeConfig, authConfig
│   │   ├── context/        # AuthContext.tsx
│   │   ├── hooks/          # useAuth, useMouseParallax, useReducedMotion
│   │   ├── lib/            # supabase.ts (single client instance)
│   │   ├── pages/
│   │   │   └── auth/       # SignIn, SignUp, ForgotPassword, ResetPassword, etc.
│   │   ├── routes/         # AppRouter, ProtectedRoute, PublicOnlyRoute
│   │   ├── services/       # authService.ts (all Supabase Auth calls)
│   │   ├── types/          # auth.ts (TypeScript interfaces)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/         # supabase.ts (admin client)
│   │   ├── controllers/    # authController.ts
│   │   ├── db/             # schema.sql
│   │   ├── middleware/     # authMiddleware.ts (JWT validation)
│   │   ├── routes/         # authRoutes.ts
│   │   ├── services/       # authService.ts
│   │   ├── types/          # auth.ts
│   │   ├── validators/     # authValidator.ts (Zod)
│   │   └── server.ts
│   └── package.json
│
└── supabase/
    └── schema.sql          # Profiles table migration & RLS policies
```

---

## 🔒 Security Principles
- **No Passwords in Local Storage**: Handled strictly via Supabase Auth secure sessions.
- **Service Role Isolation**: Backend-only service role key; never bundled or exposed to Vite client.
- **Row Level Security (RLS)**: Enforced directly at Postgres database level.
- **Strict Validation**: Double-sided validation (Zod on client forms and backend request bodies).
- **No Hardcoded Roles**: Future role-based access will be dynamic from the database `profiles` table.
