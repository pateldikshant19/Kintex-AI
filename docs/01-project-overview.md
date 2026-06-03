# 01 - Project Overview

## 🏆 Kinetix AI: Sports Performance Analytics Platform

Kinetix AI is a comprehensive full-stack sports analytics platform designed to transform how athletes train, how coaches make decisions, and how teams achieve peak performance. The platform bridges the gap between raw athletic talent and elite-level performance through intelligent data analysis and actionable insights.

---

## 🎯 Purpose & Vision

The platform addresses the "guesswork" era in sports by creating a unified intelligence layer. Key objectives include:
*   **Preventable Injury Reduction**: Predicting joint strain and workload thresholds before injuries happen.
*   **Performance Optimization**: Overcoming performance plateaus using data-driven metrics.
*   **Data Integration**: Aggregating wearable, match, and telemetry data into role-specific views.

---

## 🏅 Supported Sports

Kinetix AI is customized with sport-specific metrics and interactive features for three major disciplines:
- ⚽ **Football (Soccer)**: High-intensity run tracking, positioning, and set-piece/tactical insights.
- 🏏 **Cricket (Indore Eagles)**: Comprehensive wagon wheel coordinates, pitch length maps (good length, yorkers), draggable team layouts, and computer vision bowling action analysis.
- 🏃‍♂️ **Track & Field**: Sprint mechanics, acceleration curves, endurance pacing, and personal best indicators.

---

## 👥 Unified Entry: Public Hub vs. Private Pro Portal

The application begins with a dynamic **Gateway Page** (`Gateway.js`) routing users based on security and permissions:

### 1. Kinetix Public Hub (Unauthenticated Portal)
Accessible to the general public to engage fans and scouts:
*   **"Predict the Play" Game Simulator**: Dynamic crowd intelligence match prediction game.
*   **Interactive Spatial Match Canvas**: Visualized timeline momentum graphs.
*   **Public Player Encyclopedia**: Searchable directory of team athletes, career milestones, records, and statistics.

### 2. Kinetix Professional Portal (Authenticated Portal)
Behind a secure JSON Web Token (JWT) gate. Standard role-based access control includes:
- **👨💼 Manager**: Comprehensive squad overview, injury risk forecasting, availability dashboards, and roster CRUD control.
- **🏃‍♂️ Athlete**: Personalized biometric dashboards, recovery logs, and automated training recommendations.
- **📊 Analyst**: Core predictive workspace, importing telemetry datasets, and exporting detailed logs.

---

## ✨ Core Key Features

- **Mathematical Wagon Wheels & Pitch Maps**: Interactive coordinates rendering line vectors, radial canvas scoring blurs, and delivery classifications.
- **Draggable Field Layouts**: Drag field placements in real-time, pulling up interactive side-drawers containing player bios.
- **Real-Time Sockets**: Instantaneous scoreboard, batsman stats, and win probability updates synced over Socket.IO during simulated deliveries.
- **Computer Vision Action Lab**: Tracking cricket balls with custom OpenCV contours and checking bowling legality (15° elbow flexion watchdogs) via MediaPipe Pose.
- **Predictive Estimators**: Deep ML pipelines evaluating Win Probabilities (XGBoost), Injury Risks (Random Forest), and Fatigue Index (Ridge Regression).

---

## ⚙️ Realized Technology Stack

- **Frontend**: React 18 (Hooks & Contexts), React Router v6, Tailwind CSS, `react-konva` (Spatial Canvas), Recharts (Data Charts), `socket.io-client`.
- **Backend**: Node.js, Express.js, `socket.io` (Websocket Server), `bcryptjs` (Password Hashing), `jsonwebtoken` (Stateless Authorization).
- **Database**: MongoDB (NoSQL) & Mongoose ODM.
- **AI/ML & CV Engines**: Python 3.9+, scikit-learn, XGBoost, OpenCV, and MediaPipe Pose (executed via Node `exec` child processes with built-in Javascript mathematical fallbacks).