# uni-task-tracker

Frontend for the [Uni Task Tracker](https://github.com/ch-devx/uni-task-tracker-api) project — a university task manager with subject organization, deadline tracking, and urgency indicators.

Built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies.

**Live demo:** https://ch-devx.github.io/uni-task-tracker/

![App screenshot](https://github.com/user-attachments/assets/d27278aa-8f41-41dc-bd50-4afaa6dea37c)

---

## Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styles | CSS3 (custom properties, animations, responsive) |
| Logic | Vanilla JavaScript (ES2020+, no frameworks) |
| API | [uni-tasks-worker](https://github.com/ch-devx/uni-task-tracker-api) — Cloudflare Worker + Neon PostgreSQL |
| Hosting | GitHub Pages |

---

## Features

- Create, edit, and delete tasks with title, description, subject, and deadline
- Automatic sorting by due date
- Visual urgency indicators: overdue (red), upcoming (yellow), on track (green)
- Subject management with custom colors
- Completed tasks view
- Responsive design, optimized for mobile
- Slide-in sidebar, bottom sheet modals, toast notifications

---

## Project structure

```
uni-task-tracker/
├── index.html   # Markup and DOM structure
├── style.css    # Design tokens, layout, components
└── app.js       # API calls, state, UI interactions
```

---

## Local development

Open `index.html` directly in a browser, or serve it with any static server:

```bash
npx serve .
```

The `API` constant at the top of `app.js` points to the live Worker. To test against a local backend, update it:

```js
// app.js
const API = 'http://localhost:8787';
```

---

## Configuration

The Worker URL lives in a single constant at the top of `app.js`:

```js
const API = 'https://uni-tasks-worker.ch-devx.workers.dev';
```

If the Worker URL changes, update that line and push. GitHub Pages serves `index.html` directly from the `main` branch — any push to `main` is live within seconds.

---

## Security model

The public demo is **read-only by design**. The frontend holds no secrets — write operations are gated server-side by a Bearer token stored as a Cloudflare Worker secret. See the [API repo](https://github.com/ch-devx/uni-task-tracker-api) for the full security model.

---

## API

This frontend consumes the [uni-tasks-worker REST API](https://github.com/ch-devx/uni-task-tracker-api). All requests go to `https://uni-tasks-worker.ch-devx.workers.dev`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subjects` | List all subjects |
| `GET` | `/tasks` | List pending tasks |
| `GET` | `/tasks/done` | List completed tasks |
| `PATCH` | `/tasks/:id/toggle` | Toggle pending ↔ done |

Write endpoints (`POST`, `PUT`, `DELETE`) require an `Authorization: Bearer` token and are disabled in the public demo.