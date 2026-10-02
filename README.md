# Task Manager — CRUD App (Angular + Express + MongoDB)

A simple CRUD (Create, Read, Update, Delete) task manager.

- **Frontend**: Angular 19 (standalone components) — `frontend/`
- **Backend**: Node.js + Express + Mongoose — `backend/` (runs as a plain server locally, and as a Netlify serverless function in production)
- **Database**: MongoDB Atlas (free tier)
- **Deploy**: Both frontend and backend deploy together to **Netlify** (free, no card required) — the Express API runs as a Netlify Function at `/api/*`, same origin as the frontend, so there's no CORS to configure in production · DB → MongoDB Atlas (free)

> We originally planned to host the backend on Render, but Render now requires a card even for its free tier. Netlify Functions avoids that entirely and keeps everything on one free account.

Node.js v22.14.0 was installed locally into `~/.local/node-v22.14.0-darwin-arm64` and added to your `PATH` in `~/.zshrc` (open a new terminal tab, or run `source ~/.zshrc`, to pick it up).

---

## 1. Run it locally

### 1.1 Create a free MongoDB Atlas database

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free, no credit card needed for the free tier).
2. Create a new **free (M0) cluster** — pick any cloud provider/region close to you.
3. Under **Database Access**, create a database user (username + password) — save these.
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) — simplest for a demo app. For production you'd restrict this.
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
6. Add a database name to the path, e.g. `.../taskdb?retryWrites=true&w=majority`.

### 1.2 Configure and run the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and paste your real MongoDB URI into `MONGODB_URI`.

```bash
npm install      # already done, but safe to re-run
npm run dev      # starts on http://localhost:5050
```

Visit http://localhost:5050/api/health — you should see `{"status":"ok"}`, and the terminal should print `Connected to MongoDB`.

### 1.3 Run the frontend

In a second terminal:

```bash
cd frontend
npm start        # ng serve, starts on http://localhost:4200
```

Visit http://localhost:4200 — you should see the Task Manager UI, able to create/edit/delete/complete tasks, all persisted in MongoDB Atlas.

---

## 2. Push the code to GitHub

Netlify deploys by connecting to a GitHub repo.

```bash
cd /Users/hasaam/Documents/Project
git init
git add .
git commit -m "Initial CRUD app: Angular frontend + Express backend"
```

Create a new empty repo on GitHub (https://github.com/new), then:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

---

## 3. Deploy to Netlify (frontend + backend, one site, free, no card)

The repo root has a `netlify.toml` that builds the Angular frontend AND bundles the Express backend (`backend/netlify/functions/api.js`) as a serverless function, in one deploy:

```toml
[build]
  command = "npm install --prefix frontend && npm run build --prefix frontend && npm install --prefix backend"
  publish = "frontend/dist/frontend/browser"

[functions]
  directory = "backend/netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Steps:

1. Go to https://app.netlify.com and sign up / log in with GitHub (no card required for this).
2. **Add new site** → **Import an existing project** → connect GitHub → pick your repo.
3. Netlify should auto-read the build settings from `netlify.toml` (base directory, build command, publish directory, functions directory) — just confirm and continue.
4. Before/after the first deploy, add an environment variable (Site configuration → Environment variables):
   - `MONGODB_URI` = your Atlas connection string (same one in your local `backend/.env`)
5. Deploy (or redeploy, if you added the env var after the first deploy — Deploys → Trigger deploy). Netlify gives you a URL like `https://your-app.netlify.app`.
6. Test the API directly: visit `https://your-app.netlify.app/api/health` → should show `{"status":"ok"}`.

No `CORS_ORIGIN` env var is needed in production — the frontend and API are served from the same Netlify domain, so there's no cross-origin request at all. (`CORS_ORIGIN` in your local `.env` is still used by `cors()` for local dev, where the Angular dev server on port 4200 calls the API on port 5050.)

> Netlify Functions have a free-tier usage limit (125k invocations/month, 100 hours of runtime) — more than enough for a demo/portfolio app.

---

## 4. Verify end to end

Visit your Netlify URL. Create, edit, complete, and delete a task — it calls the Netlify Function at `/api/*`, which reads/writes MongoDB Atlas. Everything is free, no card anywhere.

---

## Project structure

```
Project/
├── netlify.toml                 # Netlify build + functions + redirects config
├── backend/                     # Express + Mongoose REST API
│   ├── src/
│   │   ├── app.js                # Express app (routes, middleware) — no listen()
│   │   ├── server.js             # Local dev entry point: connects Mongo + app.listen()
│   │   ├── controllers/taskController.js
│   │   ├── models/Task.js
│   │   └── routes/taskRoutes.js
│   ├── netlify/functions/api.js  # Wraps app.js as a Netlify serverless function
│   ├── .env.example
│   └── package.json
└── frontend/                     # Angular 19 standalone app
    └── src/app/
        ├── task.ts              # Task interface
        ├── task.service.ts      # HTTP calls to the API
        ├── task-list/           # List + delete + toggle complete
        ├── task-form/           # Create/edit form
        └── app.routes.ts
```

## API reference

| Method | Endpoint            | Description       |
|--------|----------------------|--------------------|
| GET    | `/api/tasks`         | List all tasks     |
| GET    | `/api/tasks/:id`     | Get one task       |
| POST   | `/api/tasks`         | Create a task      |
| PUT    | `/api/tasks/:id`     | Update a task      |
| DELETE | `/api/tasks/:id`     | Delete a task      |
