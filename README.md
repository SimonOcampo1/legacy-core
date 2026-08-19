# Legacy Core

[![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Appwrite](https://img.shields.io/badge/Appwrite-FD366E?logo=appwrite&logoColor=white)](https://appwrite.io)

> A private archive for the groups that keep a story going.

Legacy Core holds the memory of a group: who belongs to it, what happened and when, the photographs, and the long-form pieces someone sat down to write. Every group sees only its own archive, and nobody gets in without an admin letting them in.

## Features

- **Group-scoped by default.** Switch groups and the directory, timeline, gallery and narratives all follow. Nothing leaks across.
- **Member directory with profiles.** Each member has a card and a page of their own.
- **Shared timeline.** The group's events, ordered and browsable.
- **Long-form narratives.** A TipTap editor with inline images, placeholders and character count, so a story is written as a story and not as a caption.
- **Voice comments.** Record audio in the browser and attach it to a narrative, next to the written replies. Some memories are worth hearing in the voice that carries them.
- **Approval flow.** New accounts land on a pending screen until an admin approves them.
- **Two levels of administration.** A per-group console for members, timeline, gallery, narratives and settings; a global console above it.
- **Composable backgrounds.** Aurora, mesh gradient, particles, grain, spotlight and interactive grid layers, each its own component.

## Structure

```
src/
  pages/            Home · Directory · Profile · Timeline · Gallery
                    SharedNarratives · NarrativeDetail
                    AdminConsole · GlobalConsole · PendingApproval
  components/
    admin/          Member, timeline, gallery, narrative and request managers
    auth/           Login modal and protected routes
    comments/       Audio recorder, player and comment threads
    groups/         Group switcher, manager and logo
    layout/         App shell and user menu
    ui/             Background layers, modals, empty states, motion primitives
  lib/appwrite.ts   Backend client
  types/            Shared type definitions
scripts/            Maintenance: audio bucket creation, data migration
```

## Getting started

Requires Node 18 or newer and an [Appwrite](https://appwrite.io) project.

```bash
git clone https://github.com/SimonOcampo1/legacy-core.git
cd legacy-core
npm install
cp .env.example .env
npm run dev
```

Then fill in `.env`:

| Variable | Value |
|---|---|
| `VITE_APPWRITE_ENDPOINT` | Your Appwrite endpoint, e.g. `https://cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | The project id from your Appwrite console |

The app runs at `http://localhost:5173`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with HMR |
| `npm run build` | Type-check with `tsc -b`, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint across the project |

> [!IMPORTANT]
> Audio comments need a storage bucket that does not exist in a fresh Appwrite project. Run `node scripts/create-audio-bucket.mjs` once before recording anything, or uploads will fail.

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · Appwrite · TipTap · Framer Motion · Lenis · React Router 7 · Sonner for toasts · date-fns
