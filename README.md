# Task Manager — CRUD App (Angular + Express + MongoDB)

A simple CRUD (Create, Read, Update, Delete) task manager.

- **Frontend**: Angular 19 (standalone components) — `frontend/`
- **Backend**: Node.js + Express + Mongoose — `backend/`
- **Database**: MongoDB Atlas (free tier)
- **Deploy**: Frontend → Netlify (free) · Backend → Render (free) · DB → MongoDB Atlas (free)

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

Both Render and Netlify deploy by connecting to a GitHub repo.

> **Prerequisite**: `git` isn't installed on this machine yet (it ships with Xcode Command Line Tools). Run `xcode-select --install`, click **Install** in the dialog that pops up, and wait for it to finish (~5-10 min) before continuing. This is a one-time, one-click step only you can do — it can't be done headlessly.

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

## 3. Deploy the backend (Render — free)

1. Go to https://render.com and sign up / log in (you can sign in with GitHub).
2. **New** → **Web Service** → connect your GitHub repo.
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Add environment variables (Render dashboard → Environment):
   - `MONGODB_URI` = your Atlas connection string
   - `CORS_ORIGIN` = your future Netlify URL (you can update this after step 4, e.g. `https://your-app.netlify.app`)
   - `PORT` = `5050` (Render sets its own `PORT` env var automatically and Express already reads `process.env.PORT`, so this is just a fallback)
5. Deploy. Render gives you a URL like `https://your-backend.onrender.com`.
6. Test it: visit `https://your-backend.onrender.com/api/health`.

> Free Render web services spin down after inactivity and take ~30-60s to wake up on the next request — normal for the free tier.

---

## 4. Deploy the frontend (Netlify — free)

Netlify works fine for an Angular static build. `frontend/netlify.toml` is already set up with the build command, publish directory, and an SPA redirect rule (needed so routes like `/tasks/123/edit` don't 404 on refresh).

1. Update `frontend/src/environments/environment.prod.ts` with your real Render URL:
   ```ts
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend.onrender.com/api',
   };
   ```
   Commit and push this change.
2. Go to https://app.netlify.com and sign up / log in with GitHub.
3. **Add new site** → **Import an existing project** → connect GitHub → pick your repo.
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build` (auto-filled from `netlify.toml`)
   - **Publish directory**: `frontend/dist/frontend/browser` (auto-filled from `netlify.toml`)
5. Deploy. Netlify gives you a URL like `https://your-app.netlify.app` (you can rename this in Site settings → Domain management).
6. Go back to Render and update the backend's `CORS_ORIGIN` env var to this exact Netlify URL, then redeploy the backend (or it will reject requests from the frontend due to CORS).

---

## 5. Verify end to end

Visit your Netlify URL. Create, edit, complete, and delete a task — it should call your Render backend, which reads/writes MongoDB Atlas. Everything is free tier.

---

## Project structure

```
Project/
├── backend/                   # Express + Mongoose REST API
│   ├── src/
│   │   ├── controllers/taskController.js
│   │   ├── models/Task.js
│   │   ├── routes/taskRoutes.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/                   # Angular 19 standalone app
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
