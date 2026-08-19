# Legacy Core

**A private archive for the groups that keep a story going.**

Multi-group memory platform: a member directory, a shared timeline, a gallery and long-form narratives, each scoped to the group you belong to. Access is invite-and-approval based — nothing is public.

## 🚀 Features

- **Group-scoped everything** — switch between groups and the directory, timeline, gallery and narratives all follow.
- **Rich narratives** — TipTap editor with images, placeholders and character count.
- **Voice comments** — record audio in the browser and attach it to any narrative, alongside text.
- **Approval flow** — new accounts land in a pending state until an admin lets them in.
- **Two consoles** — a per-group admin console (members, timeline, gallery, narratives, settings) and a global console above it.
- **Layered visual system** — aurora, mesh gradient, particles, grain and spotlight backgrounds as composable components.

## 📂 Structure

```
src/pages/           Home · Directory · Profile · Timeline · Gallery
                     SharedNarratives · NarrativeDetail
                     AdminConsole · GlobalConsole · PendingApproval
src/components/
  admin/             Member, timeline, gallery, narrative and request managers
  auth/              Login modal and route protection
  comments/          Audio recorder, player and comment threads
  groups/            Group switcher, manager and logo
  ui/                Background layers, modals, empty states, motion primitives
src/lib/appwrite.ts  Backend client
scripts/             One-off maintenance scripts (audio bucket, migrations)
```

## 🛠️ Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Appwrite · TipTap · Framer Motion · Lenis · React Router

## 💻 Setup

```bash
git clone https://github.com/SimonOcampo1/legacy-core.git
cd legacy-core
npm install
cp .env.example .env   # fill in your Appwrite endpoint and project id
npm run dev
```
