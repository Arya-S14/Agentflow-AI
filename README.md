# Agentflow_AI – Agentic AI Operations Automation Platform

**Agentflow_AI** is a full-stack AI Operations Automation Platform designed for operators to describe automations in natural language, generate executable visual workflow graphs, edit them on a drag-and-drop React Flow canvas, execute them via a multi-agent orchestration engine (Planner, Execution, Validation, Recovery, Monitoring), handle third-party tool integrations (Gmail, Slack, Discord, Google Sheets) with OAuth & encrypted credentials, stream live execution events via Socket.IO, and manage background task queues.

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.x or higher installed locally.
- **npm**: v9.x or higher installed.
- *(Optional)* **MongoDB** & **Redis**: If MongoDB or Redis are not running on your local machine, **Agentflow_AI automatically uses lightweight in-memory fallbacks** for both database storage and background queues so you can test immediately without any external services!

---

### 2. Installation Steps

Clone or download the project workspace, then navigate to the project root directory:

```bash
cd Agentflow_AI
```

#### Step 2.1: Automatic Setup (All-in-one)
Run the root setup command to install dependencies across the root, backend (`server/`), and frontend (`client/`):

```bash
npm run setup
```

Or install manually in each folder:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### 3. Environment Variables Configuration

Both the `server` and `client` directories include `.env` configuration files.

#### Server Environment (`server/.env`)
Create or verify `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/agentflow_ai
JWT_SECRET=agentflow_super_secret_jwt_key_2026
CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
CLIENT_URL=http://localhost:3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Optional AI API Keys (If blank, system uses deterministic rule-based builder)
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

#### Client Environment (`client/.env.local` - Optional)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

### 4. Running the Project Locally

You can launch both the backend API server and Next.js frontend concurrently using a single command from the project root:

```bash
npm run dev
```

Alternatively, you can run the backend and frontend in separate terminal windows:

#### Terminal 1: Start Backend API & Socket.IO Server
```bash
cd server
npm run dev
```
*Backend runs on: `http://localhost:5000`*

#### Terminal 2: Start Next.js Frontend Console
```bash
cd client
npm run dev
```
*Frontend app opens at: `http://localhost:3000`*

---

## ⚡ Zero-Friction Fallback Systems

Agentflow_AI is built for zero friction during local evaluation:
1. **Database Fallback**: If local MongoDB is unreachable, the system automatically uses an in-memory data store for Mongoose models.
2. **Queue Fallback**: If Redis is not running, BullMQ seamlessly uses an asynchronous in-memory background task runner.
3. **AI Fallback**: Prompt-to-workflow generation attempts OpenRouter first, Google Gemini second, and falls back to a deterministic rule-based engine if no keys are provided.

---

## 🛠️ Tech Stack Overview

- **Frontend**: Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, React Flow (`@xyflow/react`), Socket.IO client, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, BullMQ, ioredis, Socket.IO, Helmet, Morgan, Compression, Express-Validator, Bcrypt.js.
- **Agent Orchestrator Pipeline**:
  1. **Planner Agent**: Performs graph topological sorting & confidence scoring.
  2. **Execution Agent**: Executes integration tasks & AI providers.
  3. **Validation Agent**: Enforces schema validation and checks outputs.
  4. **Recovery Agent**: Classifies errors (`MISSING_FIELDS`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and handles backoff retries or escalation.
  5. **Monitoring Agent**: Emits Socket.IO live timeline events and writes `ExecutionLog` entries.

---

## 🌐 Main Application Routes

| Route | Description |
| :--- | :--- |
| `/` | Marketing Landing Page showcasing platform capabilities |
| `/login` | Operator sign-in with JWT authentication |
| `/register` | New user registration form |
| `/dashboard` | Main Operator Console with KPI stats, executions stream, & AI feed |
| `/workflows` | Workflows library with search, clone, versioning, & execution triggers |
| `/workflows/builder` | AI Prompt-to-Workflow generator wizard |
| `/workflows/[id]` | Visual drag-and-drop React Flow canvas graph editor & node inspector |
| `/executions` | Execution run logs with status badges & filter controls |
| `/executions/[id]` | Detailed live agent timeline stream over Socket.IO & payload inspector |
| `/integrations` | OAuth & credential manager for Gmail, Slack, Discord, Google Sheets |
| `/settings` | Operator profile management & infrastructure health monitor |

---

## 🧪 Step-by-Step Guide: Testing Real Integrations

You can test real third-party actions (**Gmail**, **Slack**, **Discord**, and **Google Sheets**) in two ways: via **Direct Token Entry** (instant setup) or **OAuth 2.0 Authorization**.

### Method 1: Instant Testing via Direct Token Entry (Recommended for Quick Testing)

1. **Navigate to Integrations Page**:
   - Open your deployed app (or `http://localhost:3000`) and log in.
   - Go to the **Third-Party Integrations** section (`/integrations`).

2. **Connect a Connected Account**:
   - Click **Enter Token** on any provider card (e.g., Slack, Discord, Gmail, or Google Sheets).
   - Paste your actual Bot/API Token or OAuth Access Token:
     - **Slack**: Paste your Slack Bot User OAuth Token (`xoxb-...`).
     - **Discord**: Paste your Discord Bot Token.
     - **Google Sheets / Gmail**: Paste your Google Access Token.
   - Click **Save Encrypted Token**. The badge will change to `CONNECTED`.

3. **Build & Execute a Workflow**:
   - Navigate to **Workflows** -> **Builder** (`/workflows/builder`).
   - Create or open a workflow containing an integration action node (e.g., *Slack Notification*, *Gmail Dispatcher*, *Google Sheets Append*, or *Discord Alert*).
   - Configure the node parameters (e.g., target email, channel ID `#general`, or spreadsheet ID).
   - Click **Execute Workflow**.

4. **Verify Real Results**:
   - Open the live **Execution Details** page (`/executions/[id]`).
   - Watch the **Execution Agent** execute the node live over Socket.IO.
   - Check your actual Slack channel, Discord server, Gmail inbox, or Google Sheet to see the real message or row appended!

---

### Method 2: Testing via Full OAuth 2.0 Authorization

1. **Configure Backend Environment Variables (`server/.env`)**:
   - Set up your OAuth Client ID and Client Secret in `server/.env` or Vercel/Render settings:
     ```env
     GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     SLACK_CLIENT_ID=your-slack-client-id
     SLACK_CLIENT_SECRET=your-slack-client-secret
     DISCORD_CLIENT_ID=your-discord-client-id
     DISCORD_CLIENT_SECRET=your-discord-client-secret
     ```
2. **Authorize via OAuth**:
   - Go to `/integrations` and click **Authorize OAuth** on the provider card.
   - Log in and grant requested permissions on Google, Slack, or Discord's authorization screen.
   - Upon redirect, credentials are encrypted with AES-256 and stored safely.
3. **Execute Workflows**: Trigger your workflow to send real emails, post messages, or edit sheets automatically!

---

## 🔒 Security Features
- Password hashing with **Bcrypt** (cost factor 12).
- AES-256-CBC encryption at rest for third-party OAuth access & refresh tokens.
- Express rate limiting on `/api/auth` endpoints.
- Helmet security headers and CORS protection.

---

## 📄 License
MIT License. Created for Agentic AI Operations.
