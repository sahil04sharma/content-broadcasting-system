# Content Broadcasting System — Frontend

A React + Tailwind frontend for an educational content broadcasting system.
Teachers upload subject-based content, principals approve/reject it, and the
public `/live/:teacherId` page shows the currently active broadcast.

## Tech Stack

- **React 18** + **Vite** (JavaScript / ES6+)
- **Tailwind CSS** for styling
- **React Router v6** for routing & role-based access
- **React Hook Form + Zod** for forms & validation
- **TanStack React Query** for data fetching, caching, polling
- **Axios** ready service layer (mock + replaceable)
- **react-hot-toast** for notifications

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Demo accounts

| Role      | Email                     | Password   |
|-----------|---------------------------|------------|
| Principal | principal@school.edu      | password   |
| Teacher   | teacher@school.edu        | password   |
| Teacher   | rahul@school.edu          | password   |

Public live page (no auth):
- `http://localhost:5173/live/u_teacher_1`

### Build

```bash
npm run build
npm run preview
```

## Features

- Authentication with token (localStorage), protected routes, role-based redirects
- Teacher: Dashboard, Upload (drag-drop, validation, preview), My Content (filters, search)
- Principal: Dashboard, Pending Approvals (approve/reject with reason modal), All Content (filters + pagination)
- Public Live page with auto-refresh polling and content rotation
- Empty / loading (skeleton) / error states everywhere
- Dark mode toggle
- Memoized list cards, debounced search, pagination for large lists

## Replace Mock API with Real Backend

All API calls go through `src/services/*.service.js`. Each method's body
currently uses the in-browser mock (`src/services/mock/db.js`). To swap to
a real backend:

1. Set `VITE_API_BASE_URL` (e.g. `https://api.example.com`) in `.env`.
2. In any service method, replace the mock call with `http.get/post/...`
   from `src/services/http.js` — the axios client already attaches the auth
   token and handles 401s.

Example:
```js
// services/auth.service.js
async login(creds) { return http.post('/auth/login', creds); }
```

## Folder Structure

```
src/
  components/    Reusable UI (Sidebar, Topbar, Modal, ContentCard, Skeleton, ...)
  context/       AuthContext, ThemeContext
  hooks/         useDebounce, ...
  layouts/       AppLayout (sidebar + topbar shell)
  pages/         auth/, teacher/, principal/, public/
  services/      auth, content, approval (+ http client + mock db)
  utils/         format helpers, zod validators
```

See `Frontend-notes.txt` for architecture & decision notes.
