# 🚀 Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide covers deploying the **Backend (Spring Boot + PostgreSQL)** to **Render** and the **Frontend (React + Vite)** to **Vercel**.

---

## 🏗 Part 1: Backend & Database Deployment on Render

### Method 1: Instant Blueprint Deploy (Recommended)
Because the repository includes [`render.yaml`](./render.yaml), Render can automatically provision both the PostgreSQL database and the Spring Boot Docker web service in one click.

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect your repository.
5. Render will detect [`render.yaml`](./render.yaml) and display:
   - **Database**: `password-vault-db` (PostgreSQL Free Tier)
   - **Web Service**: `password-vault-backend` (Docker)
6. Click **Apply**.
7. Once deployed, copy your backend URL (e.g. `https://password-vault-backend.onrender.com`).

---

### Method 2: Manual Deploy on Render

If you prefer to configure services manually:

#### Step 1: Create PostgreSQL Database
1. In Render, click **New +** → **PostgreSQL**.
2. Name: `password-vault-db`
3. Database: `passwordmanagerdb`
4. User: `admin`
5. Plan: **Free**
6. Click **Create Database**.
7. Once created, copy the **Internal Database URL** (or **External Database URL**).

#### Step 2: Create Web Service
1. In Render, click **New +** → **Web Service**.
2. Connect your repository.
3. Configure the following:
   - **Name**: `password-vault-backend`
   - **Language / Environment**: `Docker`
   - **Root Directory**: `Backend` (or leave blank if specifying Dockerfile path)
   - **Dockerfile Path**: `./Backend/Dockerfile`
   - **Docker Context**: `./Backend`
   - **Plan**: **Free**
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | *(paste your Render Postgres URL)* | Spring Boot parses `postgres://` or `postgresql://` automatically |
   | `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173` | Allows requests from your Vercel frontend |
   | `COOKIE_SECURE` | `true` | Ensures cookies use HTTPS in production |
   | `COOKIE_SAME_SITE` | `None` | Required for cross-domain cookies between Vercel and Render |
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://password-vault-backend.onrender.com`).

---

## ⚡ Part 2: Frontend Deployment on Vercel

### Step 1: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub/GitLab repository.

### Step 2: Configure Project Settings
1. **Framework Preset**: Select **Vite**.
2. **Root Directory**: Click **Edit** and select `Frontend`.
3. Build and Output settings are automatically configured via [`Frontend/vercel.json`](./Frontend/vercel.json):
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables
Expand **Environment Variables** and add:
| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | `https://your-backend-service.onrender.com` | Your deployed Render backend URL (no trailing slash) |

### Step 4: Deploy
1. Click **Deploy**.
2. Vercel will install dependencies, build the production assets, and publish your site with automatic HTTPS.
3. Your app will be live at `https://<your-project-name>.vercel.app`.

---

## 🔒 Verification & Post-Deployment Checklist

1. **Verify Backend Health**:
   Open `https://<your-backend-service>.onrender.com/api/health` in your browser. It should respond with `{"status":"UP","service":"secure-password-vault"}` with HTTP 200 OK.
2. **Test Admin Login**:
   Open your Vercel URL, navigate to Login, and use the default seeded credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. **Cross-Origin Authentication**:
   Verify that JWT authentication and refresh tokens function properly. Cookies are set with `SameSite=None; Secure`, ensuring cross-domain requests between Vercel and Render are accepted by all modern browsers.
