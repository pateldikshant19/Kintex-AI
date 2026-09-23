# Kinetix AI — Sports Analytics Platform

Kinetix AI is a sports analytics platform built for professional cricket teams.
It brings player performance, workload tracking, injury-risk intelligence, and live match analytics into a single unified interface — for managers, data analysts, and players.

---

## Project Structure

```
sport/                          ← Project root
├── src/                        ← React frontend (Create React App)
│   ├── pages/                  ← All page-level components
│   │   ├── Login.js            ← Authentication page
│   │   ├── Dashboard.js        ← Role router (player/manager/analyst)
│   │   ├── DashboardManager.js ← Manager dashboard
│   │   ├── DashboardAnalyst.js ← Analyst dashboard
│   │   ├── DashboardPlayer.js  ← Player dashboard
│   │   ├── CricketLab.js       ← Live match, CV analysis, win probability
│   │   ├── AdminPanel.js       ← Admin controls
│   │   └── ...
│   ├── components/             ← Reusable UI components
│   │   ├── Navbar.js
│   │   ├── ProtectedRoute.js
│   │   └── ...
│   ├── context/                ← React context (auth, theme)
│   ├── hooks/                  ← Custom React hooks
│   ├── styles/                 ← CSS stylesheets
│   └── utils/                  ← Frontend helpers (apiService, etc.)
│
├── server/                     ← Node.js / Express backend
│   ├── server.js               ← Entry point — HTTP + Socket.IO server
│   ├── routes/                 ← API route handlers
│   │   ├── auth.js             ← Login, signup, JWT
│   │   ├── players.js          ← Player CRUD
│   │   ├── cricket.js          ← Cricket AI/ML/CV endpoints
│   │   ├── injuryIntelligence.js ← Injury risk intelligence API
│   │   ├── analytics.js        ← Performance analytics
│   │   ├── dashboard.js        ← Role-based dashboard data
│   │   ├── admin.js            ← Admin & visit analytics
│   │   └── public.js           ← Public hub (no auth required)
│   ├── models/                 ← MongoDB Mongoose models (13 collections)
│   │   ├── User.js             ← Users (manager, analyst, player, admin)
│   │   ├── Player.js           ← Player profiles + stats
│   │   ├── LiveMatch.js        ← Live match data cache
│   │   ├── Injury.js           ← Injury records
│   │   ├── Performance.js      ← Performance + biometric logs
│   │   └── ...
│   ├── services/               ← Business logic modules
│   │   ├── liveMatchEngine.js  ← Polls cricket API every 10s, broadcasts via Socket.IO
│   │   ├── cricketDataProvider.js ← Fetches & normalises live match data
│   │   ├── predictionEngine.js ← Injury prediction logic
│   │   ├── recoveryEngine.js   ← Recovery time estimation
│   │   ├── ruleEngine.js       ← Injury risk rule evaluation
│   │   ├── pythonBridge.js     ← Calls Python ML scripts via child_process
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js             ← JWT verification middleware
│   │   └── tracker.js          ← Visit analytics tracker
│   ├── utils/
│   │   ├── scoreNormalizer.js  ← Normalises raw API score data
│   │   └── emailService.js     ← Nodemailer email utility
│   ├── config/
│   │   ├── injuryRules.json    ← Injury risk rule config
│   │   └── recoveryMapping.json ← Recovery time mapping config
│   └── scripts/                ← Database seed & utility scripts
│       ├── seedPlayers.js
│       ├── seed_users.js
│       └── ...
│
├── scripts/                    ← Python ML & utility scripts
│   ├── ml_predictor.py         ← XGBoost / RandomForest / Ridge Regression models
│   ├── cv_tracker.py           ← MediaPipe Pose + OpenCV bowling analysis
│   └── ...
│
├── docs/                       ← Project documentation & reports
│   ├── PROJECT_OVERVIEW.md
│   ├── CHANGELOG.md
│   ├── Kinetix_AI_Research_Paper.pdf
│   └── ...
│
├── temp/                       ← Temporary / scratch files (not used by app)
├── .env                        ← Root environment variables (React)
├── package.json                ← Frontend dependencies + scripts
└── start.bat                   ← One-click startup script
```

---

## How to Run

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`)
- Python 3.x with `.venv` (for ML features)

### Start the Backend
```bash
cd server
npm install
npm run dev
# Server starts at http://localhost:3001
```

### Start the Frontend
```bash
# From project root
npm install
npm start
# React app starts at http://localhost:3000
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 | UI, dashboards, live charts |
| Backend | Node.js + Express | API server, auth, routing |
| Real-time | Socket.IO | Live match score push |
| Database | MongoDB + Mongoose | Persistent storage |
| ML / AI | Python (XGBoost, RandomForest, Ridge) | Predictions |
| Computer Vision | MediaPipe + OpenCV | Bowling action analysis |
| Auth | JWT (8h expiry) | Secure role-based access |

---

## AI Modules

| Module | Input | Output |
|---|---|---|
| Win Probability | Score diff, wickets, overs, run rate | Win % (0–1) |
| Injury Risk | Workload, ACWR, rest days, history, fatigue | LOW / MEDIUM / HIGH |
| Fatigue Analysis | Heart rate, speed, duration, age | Fatigue index + recovery time |
| Computer Vision | Bowling video / image | Elbow angle, ICC 15° test result |
| Live Match Engine | Cricket API data every 10s | Real-time score + risk broadcast |

---

## User Roles

| Role | Access |
|---|---|
| `player` | Own profile, personal injury risk, recovery plan |
| `manager` | Full team dashboard, all player analytics, injury intelligence |
| `analyst` | Detailed performance data, ML predictions, match analysis |
| `admin` | System management, visit analytics, user management |

---

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Manager | `manager@kinetix.ai` | any |
| Analyst | `analyst@kinetix.ai` | any |
| Player | `player@kinetix.ai` | any |
| Admin | `admin@kinetix.ai` | any |

> Demo accounts work even without a MongoDB connection.

---

## Data Flow — Live Match to Dashboard

```
Cricket API (CricAPI / RapidAPI)
        ↓
liveMatchEngine.pollAndBroadcastMatches()   [every 10 seconds]
        ↓
LiveMatch.findOneAndUpdate()                [saved to MongoDB]
        ↓
io.emit('liveMatchesUpdate', matches)       [Socket.IO broadcast]
        ↓
React: socket.on('liveMatchesUpdate')       [listener in frontend]
        ↓
Dashboard re-renders with new scores        [no page refresh needed]
```

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after **8 hours**
- Role-based access control enforced per route
- Protected routes return `401` if no valid token provided
- API keys and secrets stored in `.env` (not committed to git)