# 02 - System Architecture

Kinetix AI utilizes a robust, decoupled **3-Tier Architecture** that integrates high-frequency spatial drawing layers, real-time bidirectional messaging, and scientific data science pipelines.

---

## 🏗️ 3-Tier Core Architecture

```
                                  ┌─────────────────────────┐
                                  │   Client Web Browser    │
                                  │      (React App)        │
                                  └───────────┬─────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │ HTTPS REST APIs         │ WebSocket (Socket.io)   │ User Activity (Visits)
                    ▼                         ▼                         ▼
        ┌────────────────────────────────────────────────────────────────────────┐
        │                 Express.js Application Server (Node)                   │
        │      [ JWT Auth & Session Tracker & Built-In Emulation Fallbacks ]     │
        └──────┬──────────────────────────────┬──────────────────────────┬───────┘
               │                              │                          │
               │ Spawn Child Process          │ DB ODM (Mongoose)        │ DB ODM (Mongoose)
               ▼                              ▼                          ▼
    ┌───────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
    │  Python ML & CV Labs  │      │     MongoDB Engine      │      │     MongoDB Engine      │
    │  [ml_predictor.py /   │      │ (Users, Players, Visits)│      │  (MatchAnalytics,       │
    │   cv_tracker.py]      │      │                         │      │   Performance, Injuries)│
    └───────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

### 1. Presentation Layer (Frontend) 🎨
*   **Core Chassis**: React 18 leveraging dynamic state management and functional Hooks.
*   **Visualizations**: 
    *   `react-konva` & `Konva.js` for draggable 2D tactical field alignments, Wagon Wheel hit vectors, and Bowler Pitch maps.
    *   **HTML5 Canvas Heatmap**: Direct canvas rendering (`createRadialGradient`) mapping point density gradients behind Wagon Wheel vectors.
    *   `Recharts` for high-performance SVG Win Probability trajectories and biometric telemetry graphs.
*   **Styling**: Responsive, dark-mode first design utilizing Tailwind CSS configuration tokens.
*   **Real-time Communications**: `socket.io-client` syncing scoreboard states dynamically.

### 2. Application Layer (Backend Server) ⚙️
*   **Core Runtime**: Node.js & Express.js server listening on Port `3001` (dev environment).
*   **Authentication & Security**: Stateful cryptography via `bcryptjs` hashing passwords and stateless session tokens signed via `jsonwebtoken` (JWT). No external identity providers (like Firebase) are required.
*   **Real-time Engine**: `socket.io` server managing match rooms (`joinMatch`, `leaveMatch`) and broadcasting simulated deliveries.
*   **Traffic Tracker Middleware**: Global middleware (`tracker.js`) intercepting every route to log user interaction analytics to the database.

### 3. Database Layer (Persistence) 🗄️
*   **Database Engine**: MongoDB (NoSQL JSON document database) representing unstructured telemetry datasets.
*   **Object Data Modeling (ODM)**: Mongoose enforcing structural validation rules, population logic, and indexing filters.

---

## 🐍 Data Science & Machine Learning Pipeline

Rather than running a separate network API container (like Flask or FastAPI), Kinetix AI integrates Python pipelines directly into the main Express.js application:

1.  **Direct Execution**: When prediction endpoints are requested, the Node server executes Python scripts (`ml_predictor.py` and `cv_tracker.py`) via the `child_process.exec` command, passing parameters as arguments (e.g., `--task win_probability` or `--video video.mp4`).
2.  **High-Fidelity Fallback**: To guarantee **100% operation** in environments lacking a configured Python virtual environment or missing machine learning dependencies, the Express router incorporates built-in mathematical models:
    *   *Win Probability*: Analytical sigmoid equations mapping wickets, overs, and run rate differences.
    *   *Injury Risk*: Workload index equations mimicking Random Forest models.
    *   *Fatigue Analysis*: Biometric index algorithms mapping age, heart rate, and speed modifications.
3.  **Output Parsing**: Express captures Python `stdout`, parses the printed JSON string, and responds to the client immediately.

---

## 📡 Real-time Telemetry Synchronization Pipeline

```
┌────────────────┐          POST /api/cricket/simulate-delivery          ┌────────────────┐
│  React Client  │ ────────────────────────────────────────────────────> │ Express Server │
└────────────────┘                                                       └───────┬────────┘
        ▲                                                                        │
        │                                                                        │ 1. Recalculate AI metrics
        │                                                                        │ 2. Save delivery event
        │                                                                        ▼
        │                       emit("deliveryUpdate")                   ┌────────────────┐
        └─────────────────────────────────────────────────────────────── │   Socket.io    │
                             (Scoreboard, win rates, etc.)               └────────────────┘
```

1.  Coaches click **Bowl Simulated Delivery** on the dashboard.
2.  A `POST` request lands on the `/api/cricket/simulate-delivery` endpoint.
3.  The controller generates a randomized ball, appends it to the match document, and recalculates current AI Win Probabilities and player Fatigue.
4.  The server broadcasts a `deliveryUpdate` event to all Socket.IO clients joined in the match's room (e.g., `"c1"`).
5.  All connected dashboards instantly reload the scoreboard, active batsman form tiers, and Recharts trends without a page refresh.