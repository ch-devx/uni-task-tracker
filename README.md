# tareas-uni

Personal web app for managing university tasks, sorted by due date.

**Live:** https://ch-devx.github.io/tareas-uni/

## Stack

- HTML + CSS + JavaScript vanilla — no frameworks
- API: Cloudflare Worker ([tareas-uni-api](https://github.com/ch-devx/tareas-uni-api))
- Database: Neon PostgreSQL

## Features

- Create, edit, and delete tasks with title, description, subject, and deadline
- Automatic sorting by due date
- Visual urgency indicator by color (overdue, upcoming, ok)
- Subject management with custom colors
- Completed tasks view
- Responsive design — optimized for mobile

## Structure
tareas-uni/

└── index.html    # Full app in a single file

## Configuration

The Worker URL is defined in the `API` constant inside the `<script>` tag in `index.html`:

```javascript
const API = 'https://uni-tasks-worker.tareas-uni.workers.dev';
```

If the Worker URL changes, update that line and push.

## Deploy

GitHub Pages serves `index.html` directly from the `main` branch. Any push to `main` is automatically reflected on the production URL.