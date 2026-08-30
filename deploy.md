# Deployment Guide: Agentflow_AI

This guide provides step-by-step instructions for deploying **Agentflow_AI** with:
- **Backend API & Socket.IO**: Deployed on [Render](https://render.com)
- **Frontend App**: Deployed on [Vercel](https://vercel.com)
- **Database**: MongoDB Atlas (`MONGO_URI`)

---

## Step 1: Push Code to GitHub

Open terminal in the project root directory (`c:\Users\asus\OneDrive\Desktop\P`):

```bash
# 1. Initialize Git repository (if not initialized)
git init

# 2. Add all files
git add .

# 3. Commit changes
git commit -m "Deploy: Agentflow_AI production setup"

# 4. Link to your GitHub repository and push
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `agentflow-ai-backend`
   - **Region**: Select closest region (e.g. Oregon / Frankfurt / Singapore)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: Free or Starter

4. Add **Environment Variables** under the **Environment** tab:
   | Key | Recommended Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (Render default) |
   | `MONGO_URI` | `mongodb+srv://arya22420159_db_user:YIgdOETf3ftLefH7@cluster0.8r864gx.mongodb.net/agentflow_ai?appName=Cluster0` |
   | `JWT_SECRET` | `agentflow_super_secret_jwt_key_2026` |
   | `CREDENTIAL_ENCRYPTION_KEY` | `0123456789abcdef0123456789abcdef` |
   | `CLIENT_URL` | `https://YOUR-VERCEL-FRONTEND-URL.vercel.app` *(Update after Step 3)* |
   | `OPENROUTER_API_KEY` | *(Optional OpenRouter Key)* |
   | `GEMINI_API_KEY` | *(Optional Gemini Key)* |

5. Click **Create Web Service**.
6. Copy your Render Service URL (e.g., `https://agentflow-ai-backend.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In the project setup screen:
   - **Framework Preset**: Select `Next.js`
   - **Root Directory**: Click **Edit** and select `client`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`

4. Add **Environment Variables** under **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://agentflow-ai-backend.onrender.com/api` |
   | `NEXT_PUBLIC_SOCKET_URL` | `https://agentflow-ai-backend.onrender.com` |

   *(Replace `https://agentflow-ai-backend.onrender.com` with your exact Render URL from Step 2)*.

5. Click **Deploy**. Vercel will build and deploy your Next.js application.

---

## Step 4: Final Linkage & CORS Update

Once Vercel finishes deploying, copy your production Vercel URL (e.g. `https://agentflow-ai.vercel.app`):

1. Go back to [Render Dashboard](https://dashboard.render.com/).
2. Select your `agentflow-ai-backend` Web Service -> **Environment**.
3. Update `CLIENT_URL` to match your Vercel URL: `https://agentflow-ai.vercel.app`.
4. Click **Save Changes** (Render will automatically redeploy with CORS updated).

---

## 🎉 Verification Checklist

- [x] **Backend Health Check**: Visit `https://agentflow-ai-backend.onrender.com/api/health` (should return JSON `{ status: "healthy" }`).
- [x] **Frontend Landing & Auth**: Open Vercel URL, register/login a user account.
- [x] **AI Workflow Generation**: Test AI prompt builder and open graph canvas.
- [x] **Socket.IO Real-Time Stream**: Trigger an execution and inspect live logs.
