# ⚡ Placement Tracker — Smart Placement Intelligence Platform

> A full-stack, AI-powered placement tracking and analytics platform for students. Built with **FastAPI + React + Google Gemini**.

## 🧭 Overview

**Placement Tracker** helps students manage their entire campus placement journey from a single dashboard — tracking company applications, analyzing job descriptions with AI, scoring resumes against ATS systems, and getting personalized placement insights, all backed by Google Gemini.

It's a typical **3-tier architecture**:

```
React (Vite) Frontend  ⇄  FastAPI Backend  ⇄  MongoDB Atlas ⇄  Google Gemini API (AI features) ⇄  Firebase (Google Auth)
```
---

## ✨ Features

| Feature                  | Description                                                                                       |
| 🔐 **Auth System**       | Email/Password + Google OAuth via Firebase. JWT-based sessions.                                   |
| 📊 **Placement Tracker** | Excel-like table to track 100+ companies with inline edit, sort, filter, export.                  |
| 🤖 **JD Analyzer**       | Paste any job description → AI returns required skills, ATS keywords, likely interview questions. |
| 📄 **Resume Analyzer**   | Upload PDF/DOCX → AI gives ATS score, match %, missing skills, and improvement tips.              |
| 💡 **AI Insights**       | Personalized placement journey analysis with weekly goals and success predictions.                |
| 💬 **AI Chatbot**        | Full-conversation AI assistant for resume help, interview prep, and DSA tips.                     |
| 📈 **Dashboard**         | Charts, stats, recent activity feed, and quick actions.                                           |
| 👤 **Profile**           | Manage skills, target roles, and personal info.                                                   |

---


## 🛠 Tech Stack

### Backend

| Tool                         | Purpose                                     |
| **FastAPI**                  | High-performance Python API framework       |
| **Motor + MongoDB**          | Async MongoDB driver (MongoDB Atlas)        |
| **Google Gemini API**        | AI analysis (JD, resume, chatbot, insights) |
| **pdfplumber / python-docx** | Resume text extraction                      |
| **JWT (python-jose)**        | Token-based authentication                  |
| **Firebase Admin SDK**       | Google OAuth token verification             |
| **Pandas + openpyxl**        | Excel export                                |

### Frontend

| Tool | Purpose |
| **React 18 + Vite** | Fast SPA framework |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Premium animations |
| **React Router DOM** | Client-side routing |
| **Recharts** | Charts (Bar, Pie, Radar) |
| **React Dropzone** | File upload UI |
| **Zustand** | Lightweight state management |
| **React Hook Form** | Form handling and validation |
| **React Hot Toast** | Beautiful notifications |
| **Firebase JS SDK** | Google Sign-In |
| **Axios** | HTTP client |
| **React Markdown** | Render AI responses as markdown |

---

## 🏗 Architecture

```
                         ┌─────────────────────┐
                         │      Browser        │
                         │  React + Vite (SPA) │
                         └──────────┬──────────┘
                                    │ REST (Axios) + JWT
                                    ▼
                         ┌──────────────────────┐
                         │     FastAPI Backend  │
                         │  /api/v1/* endpoints │
                         └──────────┬───────────┘
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                   ▼
      ┌─────────────────┐ ┌─────────────────┐ ┌───────────────────┐
      │  MongoDB Atlas  │ │  Google Gemini  │ │ Firebase Admin SDK│
      │  (Motor async)  │ │  (AI analysis)  │ │ (Google OAuth)    │
      └─────────────────┘ └─────────────────┘ └───────────────────┘
```

---

## 📁 Project Structure

```
placement_tracker/
│
├── backend/                          # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── database.py               # MongoDB connection
│   │   ├── config/
│   │   │   └── settings.py           # Pydantic settings (env vars)
│   │   ├── models/
│   │   │   ├── user_model.py         # User Pydantic schemas
│   │   │   ├── placement_model.py    # Placement schemas + stats
│   │   │   ├── resume_model.py       # Resume analysis schemas
│   │   │   └── jd_model.py           # JD analysis schemas
│   │   ├── routes/
│   │   │   ├── auth_routes.py        # /auth/* endpoints
│   │   │   ├── placement_routes.py   # /placements/* endpoints
│   │   │   ├── resume_routes.py      # /resume/* endpoints
│   │   │   ├── jd_routes.py          # /jd/* endpoints
│   │   │   └── ai_routes.py          # /ai/* endpoints
│   │   ├── services/
│   │   │   ├── gemini_service.py     # All Gemini AI calls
│   │   │   ├── resume_parser.py      # PDF/DOCX text extraction
│   │   │   ├── ats_service.py        # ATS scoring logic
│   │   │   └── skill_matcher.py      # Skill matching utilities
│   │   └── utils/
│   │       ├── auth.py               # JWT helpers, password hashing
│   │       ├── helpers.py            # MongoDB serialization, text utils
│   │       └── validators.py         # File type/size validation
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── AppLayout.jsx     # Sidebar + main layout
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Auth page (sign in/up/forgot)
│   │   │   ├── Dashboard.jsx         # Stats, charts, quick actions
│   │   │   ├── Tracker.jsx           # Placement tracking table
│   │   │   ├── ResumeAnalyzer.jsx    # Resume upload + AI analysis
│   │   │   ├── JDAnalyzer.jsx        # JD paste + AI analysis
│   │   │   ├── Chatbot.jsx           # AI chat assistant
│   │   │   ├── Insights.jsx          # AI placement insights
│   │   │   └── Profile.jsx           # User profile settings
│   │   ├── services/
│   │   │   ├── api.js                # Axios client + all API calls
│   │   │   └── auth.js               # Firebase auth helpers
│   │   ├── hooks/
│   │   │   └── useAuth.js            # Zustand auth store
│   │   ├── utils/
│   │   │   └── constants.js          # Status colors, options
│   │   ├── App.jsx                   # Routes + providers
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Tailwind + custom styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Download |
| **Python** | 3.10+ | https://python.org |
| **Node.js** | 18+ | https://nodejs.org |
| **npm** | 8+ | (included with Node.js) |

You'll also need free accounts on:

- [MongoDB Atlas](https://cloud.mongodb.com) — Free tier (M0) works fine
- [Google AI Studio](https://aistudio.google.com) — For your Gemini API key
- [Firebase Console](https://console.firebase.google.com) — For Google Sign-In (optional)

---

## ⚡ Quick Start (TL;DR)


```bash
# 1. Clone
git clone https://github.com/yadavrahulrao/placement_tracker.git
cd placement_tracker

# 2. Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in MONGODB_URL, GEMINI_API_KEY, JWT_SECRET_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. Frontend (in a NEW terminal)
cd frontend
npm install
cp .env.example .env            # then set VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🚀 Step-by-Step Setup Guide

### 1. Clone the Project

```bash
# If you extracted from a ZIP, just cd into the folder:
cd placement_tracker

# Or clone from git:
git clone https://github.com/yadavrahulrao/placement_tracker.git
cd placement_tracker
```

---

### 2. MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Click **"Build a Database"** → choose the **FREE (M0)** tier → select the nearest region.
3. Create a **username** and **password** (save these!).
4. In **Network Access**, click **"Add IP Address"** → select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
5. In **Database**, click **"Connect"** → **"Connect your application"**.
6. Copy the connection string. It looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```
7. Replace `<password>` with your actual password and add a database name:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/placeiq?retryWrites=true&w=majority
   ```
8. Save this as your `MONGODB_URL` in the backend `.env`.

---

### 3. Google Gemini API Setup

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Click **"Create API Key"**.
3. Copy the key (it starts with `AIza...`).
4. Save this as your `GEMINI_API_KEY` in the backend `.env`.

> ✅ **Free tier**: Gemini 1.5 Flash is completely free with generous rate limits.

---

### 4. Firebase Setup

> **Note**: Firebase is only needed for Google Sign-In. Email/password auth works without it — you can skip this section if you don't need Google login.

#### A. Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com).
2. Click **"Add project"** → name it `placement_tracker` → Continue.
3. Disable Google Analytics (optional) → click **"Create project"**.

#### B. Enable Google Authentication
1. In your project, click **"Authentication"** (left sidebar).
2. Click **"Get started"** → **"Sign-in method"** tab.
3. Click **"Google"** → enable it → add your email as support email → Save.

#### C. Get the Frontend Config
1. Click **"Project Settings"** (gear icon) → **"General"** tab.
2. Scroll to **"Your apps"** → click the **Web** icon (`</>`).
3. Register the app (e.g., `placement_tracker-web`) → click **"Register app"**.
4. Copy the `firebaseConfig` values into your frontend `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=placement_tracker.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=placement_tracker
   VITE_FIREBASE_STORAGE_BUCKET=placement_tracker.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

#### D. Get the Backend Service Account
1. In Firebase, go to **"Project Settings"** → **"Service accounts"** tab.
2. Click **"Generate new private key"** → download the JSON file.
3. Rename it to `firebase-service-account.json`.
4. Place it inside the `backend/` folder (same level as `requirements.txt`).

> ⚠️ Never commit `firebase-service-account.json` to git — it's already covered by `.gitignore` (see below).

---

### 5. Backend Setup

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Download spaCy English model for advanced NLP
python -m spacy download en_core_web_sm

# Create .env file from the example
cp .env.example .env
```

Now **edit the `.env` file** with your actual values:

```env
MONGODB_URL=mongodb+srv://username:password@cluster0.abc12.mongodb.net/placement_tracker?retryWrites=true&w=majority
DATABASE_NAME=placeiq
JWT_SECRET_KEY=my-super-secret-random-key-12345
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=AIzaSy...your-gemini-key
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
ALLOWED_ORIGINS=http://localhost:5173
MAX_FILE_SIZE_MB=10
```

**Generate a secure JWT secret:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Copy the output and use it as `JWT_SECRET_KEY`.

---

### 6. Frontend Setup

```bash
# Open a NEW terminal, navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file from the example
cp .env.example .env
```

Now **edit the frontend `.env` file**:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=placement_tracker.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=placement_tracker
VITE_FIREBASE_STORAGE_BUCKET=placement_tracker.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

### 7. Run the Project

You need **two terminals** running simultaneously — one for the backend, one for the frontend.

#### Terminal 1 — Backend

```bash
cd backend
source venv/bin/activate    # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
✅ Connected to MongoDB: placeiq
🚀 PlaceIQ AI Backend started
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

#### 🎉 Open your browser at: **http://localhost:5173**

---



## 🗺 Roadmap

Email notifications for upcoming interview rounds
Mobile-responsive PWA support
Bulk import placements via CSV
Peer comparison / leaderboard (opt-in)
Dark mode toggle
Multi-resume version tracking

> Have an idea? Open an issue or start a discussion!

---


## 📄 License

This project is open source and available under the MIT License.



---
## Author 
Jatin Yadav - 
Github - https://github.com/jatinyadav2036/placement_tracker
Email - jatinya21@gmail.com
