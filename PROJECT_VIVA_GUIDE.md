# Kinetix AI Platform - Comprehensive Viva Documentation

This guide provides a comprehensive, module-by-module, technology-by-technology breakdown of the Kinetix AI project. It's tailored to help any team member completely understand and explain the full-stack architecture, codebase, and implementation details to an examiner during a viva or project defense.

---

## 1. Project Overview & Architecture
Kinetix AI is a full-stack Sports Performance Analytics Platform. It bridges the gap between raw athletic talent and elite performance by collecting, predicting, and visualizing sports data to prevent injuries and optimize performance.

### Architecture Type: Full-Stack MERN (MongoDB, Express, React, Node.js)
### Three Main Front-Facing Modules:
1. **Gateway (`src/pages/Gateway.js`)**: The root graphical landing page routing users to different system sectors (Pro Portal vs Public Hub). 
2. **Kinetix Professional Portal**: High-level private dashboard for sports managers, coaches, and athletes handling deep analytics, securely hidden behind authentication.
3. **Kinetix Public Hub (`src/public-hub/PublicHubApp.js`)**: A public-facing site allowing general users to engage with a live "Predict the Play" simulator, spatial match canvas, and public player statistics (player encyclopedia).

---

## 2. Frontend Specifications
**Tech Stack**: React 18, React Router v6, Tailwind CSS (for styling and responsiveness), Lucide React (for iconography).

- **Core Library (`react`, `react-dom`)**: Used for building component-based, interactive user interfaces with hook-based state management (`useState`, `useEffect`, `useContext`). It ensures seamless data integration dynamically without page reloads.
- **Styling (`tailwindcss`, `src/styles/App.css`)**: Tailwind handles all CSS utility classes, enabling a dark-mode first, theme-aware responsive UI. Custom base styles, gradients, and CSS variables are injected via `index.css`/`App.css` to craft a cohesive "Web3-like" visual premium aesthetic. We actively use subtle gradient accent borders to separate sections elegantly.
- **Routing (`react-router-dom`)**: Handles SPA (Single Page Application) client-side navigation. The project utilizes `<BrowserRouter>`, `<Routes>`, and `<Route>` to branch intuitively between the Gateway, Pro Portal, and Public Hub.

### Frontend Module Breakdown:
- **`src/pages/Gateway.js`**: The interactive point of entry. Shows an interactive split screen guiding user segmentation.
- **`src/components/Navbar.js`**: The global navigation bar. It is completely dynamic, managing theme-aware styling, light/dark mode toggling, and adaptive routing links depending on the active portal.
- **`src/public-hub/` (Public Features)**:
  - Includes robust independent React structures using web sockets/SSE (conceptually) or dynamic timed states for *Live Match Canvas* visualizations.
  - Implements Optimistic UI in components like the Simulator to immediately reflect point changes locally before confirming them with the backend server.

---

## 3. Backend Specifications
**Tech Stack**: Node.js, Express.js (handling RESTful API routing and middleware), JSON Web Tokens (JWT) for authentication, `bcryptjs` for encryption.

- **Server Entry (`server/server.js`)**: Boots up the background Express web application, globally applies CORS (Cross-Origin Resource Sharing) for security, parses incoming JSON request bodies, connects to MongoDB sequentially, and wires the base API root paths (e.g., `/api/users`, `/api/players`).
- **Middleware (`server/middleware/`)**: Functions that intercept incoming requests. Custom authentication middlewares validate JWT tokens passed in the Request Header, ensuring administrative HTTP routes meant for managers reject unauthenticated attempts.
- **Routes (`server/routes/`) & Controllers**: Map specific HTTP endpoints (GET, POST, PUT, DELETE) to their precise logic algorithms:
  - *Auth Routes*: Registration hashing, login credential comparisons.
  - *Data Routes*: Fetching athlete profiles, saving simulator variables, polling injuries.

---

## 4. Database Specifications
**Tech Stack**: MongoDB (NoSQL Database), Mongoose (ODM - Object Data Modeling framework).

- **Why MongoDB?**: The flexible Document-Based JSON-like structure maps perfectly to high-volume hierarchical time-series data typical in sports metrics (like session-by-session stamina, sprints) without massive SQL table joins. Mongoose enforces strict schema structures programmatically to prevent bad data insertion.

### Data Models Breakdown (`server/models/`):
- **`User.js`**: Stores account details logically separating coaches, managers, and athletes. Retains `email`, `password` (hashed), and defined string `role`.
- **`Player.js`**: Holds core permanent athletic profile information (Name, Age, Position, Team). Serves as the primary parent reference document.
- **`Performance.js`**: Logs match-by-match or specific training session metrics (passes completed, fatigue percentage, top speed) linked specifically via `playerId`.
- **`Injury.js`**: Critical to the platform's vision. Tracks current, historical, and predicted injury likelihoods, recording severity, algorithmic risk-scores, and the affected physical zones.
- **`MatchAnalytics.js`**: Keeps structured ledgers of real-time or aggregated macro match data for telemetry visualizations displayed in the Public Hub spatial canvas.
- **`Visit.js`**: An analytical telemetry scheme logging user application traffic, helping developers track engagement funnels through the gateway.

---

## 5. Development Workflow & Scripts
We logically separate the project execution but operate them simultaneously during dev:
- **Client (Frontend)**: Resides in the root folder, served generally on `http://localhost:3000`. Triggered natively via `npm run start` (leveraging `react-scripts`), configured to seamlessly fall to an alternate port via `cross-env` routing mapping if occupied.
- **Server (Backend)**: Housed physically in the `/server` sub-directory. Routinely listens on `http://localhost:5000`. Initialized via `npm run dev` employing `nodemon` allowing backend code changes to hot-reload the local server instantly without manual restarting.

---

## 6. Examiner Cheat Sheet (Anticipated Viva Questions & Answers)

**Q: "Why did you choose React over Plain HTML/JS or Templates?"**
> **A:** React utilizes an intermediary Virtual DOM mapping. Instead of repainting the entire HTML tree when data changes (which is incredibly slow), React only selectively redraws the pinpoint component that changed state. For our sophisticated Live Match Canvas and "Predict the Play" active states, this dynamic component-based rendering is what keeps the application from lagging.

**Q: "How exactly is User Authentication secured between your Frontend and Backend?"**
> **A:** When logging in, the frontend transmits credentials which the backend compares by strictly hashing the input using `bcrypt` and checking against the database. We explicitly *do not* save passwords directly as text. Upon success, a signed JWT (JSON Web Token) payload is dispatched to the client locally. For every subsequent protected request, the frontend structurally embeds this unique string token in the internal HTTP Authorization Header, which a backend middleware specifically validates before accessing private endpoints.

**Q: "How does the 'AI/Prediction' algorithmic feature structurally integrate into the backend?"**
> **A:** Our predictive engines consume large continuous volumes of historical physical metrics saved in the `Performance` and `Injury` collections. The Node backend controllers compile these values. Theoretically, background services analyze threshold derivations (like abrupt fatigue jumps combined with sprint limits dropping) mathematically generating unified 'Risk Indices'. These integers are then forwarded seamlessly over JSON back to the personalized React visualizations mapping those exact scores.

**Q: "How did you manage responsive UI styling without writing fragile cascading CSS conflicts?"**
> **A:** We heavily incorporated Tailwind CSS alongside highly specific standard configuration bindings (`tailwind.config.js`). It allows utility-first class implementation directly on the JSX tags keeping scoping physically tied to the matching component. Furthermore, rather than plain generic boxes, our `index.css` structurally registers dynamic variables mapping gradients and exact theme palettes executing our premium dark-mode Web3-style visual intent, maintaining UI code integrity drastically as opposed to managing a spaghetti web of standard CSS selectors.

**Q: "What makes the structural decoupling of the Public Hub versus the Pro Portal effective?"**
> **A:** Security and user routing encapsulation. The Public Hub operates its distinct application wrapper (`PublicHubApp.js`) loading strictly non-protected generic data (simulator points, public player graphs) without unnecessarily taxing protected API logic points. The Pro Portal remains entirely fenced strictly forcing JWT verification routes. This enforces strict logical separation of concern, drastically minimizing potential accidental data leaks and ensuring managers have rapid data fetches untampered by large volume public traffic.
