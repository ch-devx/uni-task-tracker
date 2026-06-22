# uni-task-tracker

Full-stack portfolio project — a task manager built with vanilla JS on the frontend and a Cloudflare Worker + Neon PostgreSQL API on the backend.

**Live demo:** https://ch-devx.github.io/uni-task-tracker/

![App screenshot](https://github.com/user-attachments/assets/d27278aa-8f41-41dc-bd50-4afaa6dea37c)

## Stack

- HTML + CSS + JavaScript vanilla — no frameworks
- API: Cloudflare Worker ([uni-tasks-worker](https://github.com/ch-devx/uni-task-tracker-api))
- Database: Neon serverless PostgreSQL

## Features

- Create, edit, and delete tasks with title, description, subject, and deadline
- Automatic sorting by due date
- Visual urgency indicators: overdue (red), upcoming (yellow), on track (green)
- Subject management with custom colors
- Completed tasks view
- Responsive design — optimized for mobile

## Security model

The public demo is **read-only by design**. The frontend never holds any secrets — write operations are gated server-side by a Bearer token stored as a Cloudflare Worker secret. See the [API repo](https://github.com/ch-devx/uni-task-tracker-api) for full details.

## Structure
uni-task-tracker/

└── index.html    # Full app in a single file

## Configuration

The Worker URL is defined in the `API` constant inside the `<script>` tag in `index.html`:

```javascript
const API = 'https://uni-tasks-worker.ch-devx.workers.dev';
```

If the Worker URL changes, update that line and push.

## Deploy

GitHub Pages serves `index.html` directly from the `main` branch. Any push to `main` is automatically reflected on the production URL.
