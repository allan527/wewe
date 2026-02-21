# Texas Finance (Frontend Only)

Personal Loan Management Dashboard for internal use in Uganda.

## Stack
- React + TypeScript (Vite)
- React Router data mode (`RouterProvider`)
- Tailwind CSS v4
- UI primitives aligned with shadcn component patterns
- lucide-react icons
- Sonner toasts
- localStorage persistence only

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Vercel deploy
1. Import this repository in Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`
4. Output directory: `dist`
5. No environment variables required.

## Notes
- No backend services, APIs, or databases are used.
- SMS is simulated (`console.log` + toast) using fixed templates.
- Data is stored in browser `localStorage` with project keys.
