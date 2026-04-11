# Artifacta — Archaeological Conservation App

> **V1.0 MVP** · Professional-grade artifact digitization and condition monitoring for researchers, restorers, and students.

---

## Overview

**Artifacta** gives every archaeological artifact a "digital soul" — a living passport that tracks its identity, condition, and provenance through time. The interface follows an **Industrial-Curatorial** aesthetic: high-contrast obsidian surfaces, blueprint-grid overlays, and museum-grade typography.

### Core Features

| Feature | Description |
|---|---|
| **Artifact Passport** | Create digital records with auto-generated IDs (`ARC-2026-A1B2`), classification, provenance metadata |
| **QR Identity System** | Every artifact gets a unique QR code; scan any artifact's QR to jump straight to its passport |
| **Condition Audit Log** | Append-only ledger tracking condition transitions (Excellent → Damaged) with curatorial notes |
| **Photo Vault** | Upload artifact photos directly to Supabase Storage (camera capture & gallery import) |
| **Multi-Role Auth** | User profiles with Researcher / Restorer / Student clearance levels |
| **Dashboard** | Real-time inventory stats, active alerts, and quick-action shortcuts |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native + [Expo](https://expo.dev) (Expo Go compatible) |
| **Navigation** | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| **Styling** | [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for RN) |
| **Backend** | [Supabase](https://supabase.com) — PostgreSQL, Auth, Storage |
| **Icons** | [Lucide React Native](https://lucide.dev) |
| **QR** | `react-native-qrcode-svg` (generation) + `expo-camera` (scanning) |
| **Animations** | `react-native-reanimated` (staggered entry, fade transitions) |
| **Typography** | Cormorant Garamond (display) · IBM Plex Mono (data) · Crimson Pro (body) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/go) on your phone, **or** Android/iOS emulator
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Install Dependencies

```bash
cd ArchaeologyApp
npm install
```

### 2. Configure Supabase

Create your `.env.local` from the template:

```bash
cp .env.local .env.local   # already exists as a template
```

Then open `.env.local` and replace the placeholders with your real credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-real-anon-key
```

**Where to find these:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project → **Settings** → **API**
3. Copy **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
4. Copy **anon / public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

> **Note:** `.env.local` is in `.gitignore` — your keys will never be committed.

### 3. Run the Database Schema

In your Supabase dashboard → **SQL Editor**, run the contents of:

```
supabase/schema.sql
```

This creates:
- `profiles` table (auto-populated on user signup via trigger)
- `artifacts` table (passport records)
- `condition_logs` table (append-only audit trail)
- Row Level Security (RLS) policies for all tables
- Realtime subscriptions for live updates

### 4. Start the App

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` (Android) / `i` (iOS) for emulator.

---

## Project Structure

```
ArchaeologyApp/
├── .env.local                  # 🔑 Supabase credentials (gitignored)
├── app.json                    # Expo configuration
├── babel.config.js             # Babel + NativeWind preset
├── metro.config.js             # Metro + NativeWind CSS pipeline
├── tailwind.config.js          # Custom theme (colors, fonts)
├── global.css                  # Tailwind base imports
│
├── app/                        # Expo Router — file-based routing
│   ├── _layout.tsx             # Root: fonts, auth guard, providers
│   ├── (auth)/
│   │   ├── _layout.tsx         # Auth stack layout
│   │   ├── login.tsx           # Login screen
│   │   └── register.tsx        # Registration + role selection
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab bar (Base, Archive, Scan, Profile)
│   │   ├── index.tsx           # Dashboard — "My Base"
│   │   ├── artifacts.tsx       # Artifact gallery with search
│   │   ├── scan.tsx            # QR scanner (camera)
│   │   └── profile.tsx         # User profile + sign out
│   ├── artifact/
│   │   ├── add.tsx             # Add/digitize new artifact
│   │   └── [id].tsx            # Artifact Passport detail view
│   └── condition/
│       └── [artifactId].tsx    # Condition audit log entry
│
├── src/
│   ├── components/
│   │   └── BlueprintGrid.tsx   # SVG blueprint-grid background
│   ├── constants/
│   │   └── theme.ts            # Design tokens (colors, spacing, typography)
│   ├── contexts/
│   │   └── AuthContext.tsx      # Auth state provider + useAuth hook
│   ├── hooks/
│   │   └── useAuth.ts          # Re-export of useAuth
│   └── lib/
│       ├── supabase.ts         # Supabase client (reads from .env.local)
│       └── utils.ts            # Passport ID generator, date formatting
│
└── supabase/
    └── schema.sql              # Full database schema + RLS + triggers
```

---

## Design Language

### Color Palette

| Token | Hex | Role |
|---|---|---|
| Obsidian | `#0A0C10` | Primary background |
| Carbon | `#141820` | Card / surface |
| Graphite | `#1E2330` | Elevated surface |
| Slate Wire | `#2A3040` | Borders, grid |
| Bone | `#E8E0D4` | Primary text |
| Parchment | `#C4B9A8` | Secondary text |
| Oxidized Copper | `#48A89C` | Primary accent, CTA, "good" condition |
| Terracotta Rust | `#C4553A` | Alert accent, "damaged/critical" condition |
| Antique Gold | `#B8963E` | Highlight, passport IDs |
| Blueprint Cyan | `#1A3A4A` | Background grid pattern |

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | **Cormorant Garamond 600** | Screen titles, artifact names |
| Mono | **IBM Plex Mono 400/600** | IDs, metadata, labels |
| Body | **Crimson Pro 400** | Descriptions, notes |

### Motion

- Staggered `FadeInDown` for dashboard cards and gallery items (50–100ms delay per item)
- `FadeIn` / `FadeInUp` for passport detail sections
- Subtle `active:` press states on all interactive elements

---

## Database Schema (Supabase)

### Tables

**`profiles`** — Auto-created on signup via trigger
- `id`, `username`, `full_name`, `avatar_url`, `role`, `institution`

**`artifacts`** — Core passport records
- `id`, `passport_id` (unique, e.g. `ARC-2026-A1B2`), `name`, `type`, `creator`, `date_created`, `origin`, `location`, `description`, `materials[]`, `condition`, `qr_code_data`, `photos[]`, `user_id`

**`condition_logs`** — Append-only audit trail
- `id`, `artifact_id`, `user_id`, `condition_before`, `condition_after`, `notes`, `photos[]`

### Row Level Security

- **Read**: All tables are publicly readable (museum data is open)
- **Write**: Users can only create/update their own records
- **Condition logs**: Append-only (no update/delete policies)

---

## Scripts

| Command | Description |
|---|---|
| `npx expo start` | Start Expo dev server |
| `npx expo start --android` | Launch on Android emulator |
| `npx expo start --ios` | Launch on iOS simulator |

---

## License

MIT
