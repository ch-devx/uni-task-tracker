# uni-task-tracker

Personal web app for managing university tasks, sorted by due date.

**Live:** https://ch-devx.github.io/uni-task-tracker/

## Stack

- HTML + CSS + JavaScript vanilla — no frameworks
- API: Cloudflare Worker ([uni-task-tracker-api](https://github.com/ch-devx/uni-task-tracker-api))
- Database: Neon PostgreSQL

## Features

- Create, edit, and delete tasks with title, description, subject, and deadline
- Automatic sorting by due date
- Visual urgency indicator by color (overdue, upcoming, ok)
- Subject management with custom colors
- Completed tasks view
- Responsive design — optimized for mobile

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