# 🚀 Bell24H Application: Startup & Deployment Guide

This guide walks you through running the Bell24H application—from the first install, to startup, testing, and common troubleshooting.

---

## 🗂️ 1. Script Overview: `start-bell24h.sh`

The startup script performs the following:
- Displays a startup banner.
- Ensures the main entry, `bell24h-unified-startup.js`, is executable.
- Checks the database connection using `DATABASE_URL`.
- Runs the backend server.
- Warns about any missing or misconfigured dependencies or environment variables.

---

## 📁 2. Navigate to Project Root

Make sure you’re in the Bell24H root folder:
```bash
cd /path/to/Bell24HDashboard/Bell24HDashboard
```

---

## 🔧 3. Install Dependencies

Install all backend (Node.js) dependencies:
```bash
npm install
```
> If your project has Python or other submodules:
```bash
pip install -r requirements.txt
```

---

## 🔐 4. Set Up Environment Variables

Set your PostgreSQL connection string, e.g.:
```bash
export DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
```
Replace placeholders with your actual database details.  
You can optionally use a `.env` or `.env.local` file.

---

## 🛠️ 5. Make the Script Executable

If not yet done:
```bash
chmod +x start-bell24h.sh
```

---

## 🚀 6. Run the Startup Script

Start the app with:
```bash
./start-bell24h.sh
```
You should see a startup banner, then feedback about database connectivity and server startup.

---

## 🧪 7. Test the Application Locally

After the script runs:
- Open your browser to [http://localhost:3000](http://localhost:3000)
- Test key features:
    - Login/registration
    - RFQ creation & supplier matching
    - Real-time updates (websockets)
    - AI-based explainable matching
    - Payment & PDF export

---

## ❌ 8. Troubleshooting Common Errors

| Error                                 | Solution                                                        |
|----------------------------------------|-----------------------------------------------------------------|
| `Database connection failed`           | Ensure `DATABASE_URL` is set and PostgreSQL is running          |
| `No such file or directory`            | Check if `bell24h-unified-startup.js` exists in root directory  |
| `Permission denied`                    | Run `chmod +x start-bell24h.sh`                                 |
| `Missing environment variable`         | Add the variable via `export` or `.env`                         |

- Read the terminal output carefully, as the script prints the cause of failure before exiting.

---

## 🧩 9. (Optional) Using a Process Manager

To keep your server running in the background, use [PM2](https://pm2.keymetrics.io/):
```bash
npm install -g pm2
pm2 start bell24h-unified-startup.js
```

---

## 📦 10. Deploying to Production

When your app works locally, you can deploy to platforms such as:
- [Vercel](https://vercel.com/)
- [Render](https://render.com/)
- AWS, DigitalOcean, or your own server

See `DEPLOYMENT_CHECKLIST.md` for step-by-step provider-specific instructions.
Set all environment variables in your cloud dashboard before running deployment commands.

---

## ✔️ 11. Launch Checklist

| Task                                | Status |
|--------------------------------------|--------|
| Script is executable                | ✅     |
| Environment variables are set        | ✅     |
| Dependencies are installed           | ✅     |
| Database connection is successful    | ✅     |
| Server runs at http://localhost:3000 | ✅     |
| All features are functioning         | ✅     |

---

## 🚀 What Next?

- Need help fixing a specific error?  
  **Paste the error message here for quick troubleshooting.**
- Want a code review or deployment setup (Vercel, Render, AWS, etc.)?  
  **Just ask and mention your environment.**

---

_This guide is maintained for team onboarding, QA, and support. Update as your deployment process evolves!_