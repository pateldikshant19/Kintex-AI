# 09 - Technology Stack

## ⚙️ Complete Technology Stack

### Frontend Technologies & Visualizations
- **React.js 18.2.0** - Component-based high-performance UI library.
- **React Router v6.3.0** - Client-side declarative routing and secure role authentication guards.
- **Tailwind CSS 3.1.8** - Utility-first styling framework enabling premium dark themes and responsive grids.
- **react-konva & Konva.js** - Interactive canvas layer delivering real-time draggable tactical field placements, batsman scoring wagon wheels, and bowlers pitch maps.
- **HTML5 Canvas Heatmap Engine** - Custom high-frequency rendering pipeline drawing mathematical radial blur gradients for batsman run concentration zones.
- **Recharts v3.8.1** - Premium, interactive svg charting library powering win probability trajectory area graphs.
- **Socket.io-Client v4.8.3** - Bi-directional real-time websocket client for immediate score and ML index synchronization.

### Backend & Real-Time Technologies
- **Node.js & Express.js 4.18.2** - High-concurrency event-driven web application server framework.
- **Socket.io v4.8.3** - Websocket server integration enabling live match room rooms (`joinMatch`, `leaveMatch`) and automatic delivery updates.
- **Mongoose 9.1.2** - Schema-driven MongoDB Object Document Mapper (ODM) with connection pooling.
- **jsonwebtoken 9.0.2 & bcryptjs** - Secure stateless JWT authentication tokens and cryptographic passwords.

### AI/ML & Computer Vision Stack
- **Python 3.9+** - Primary environment for data science and physical modeling.
- **scikit-learn** - RandomForestClassifier for joint load injury risk predictions, and Ridge Regression for biological fatigue indices.
- **XGBoost** - Gradient-boosted decision trees for high-accuracy live match win probabilities.
- **MediaPipe Pose** - Machine learning pipeline detecting skeletal joint nodes (shoulders, elbows, wrists) from video camera feeds.
- **OpenCV** - Computer vision processing algorithms for red ball trajectory mapping and tracking.
- **Flask/FastAPI Python Bridges** - High-fidelity fallback handlers mounted on Express to guarantee 100% operation under all environments.


### DevOps & Deployment
- **Docker** - Application containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline automation
- **npm** - Package management
- **PM2** - Process management for Node.js

### Development Tools
- **react-scripts 5.0.1** - Build tools and development server
- **nodemon 3.0.1** - Auto-reload during development
- **concurrently 8.2.2** - Run multiple scripts simultaneously
- **dotenv 16.3.1** - Environment variable management
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting

## 📦 Package.json Dependencies

### Production Dependencies
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "chart.js": "^4.4.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "firebase": "^12.7.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.11.0",
    "react-scripts": "^5.0.1"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "autoprefixer": "^10.4.15",
    "concurrently": "^8.2.2",
    "nodemon": "^3.0.1",
    "postcss": "^8.4.29",
    "tailwindcss": "^3.3.3"
  }
}
```

## 🚀 Build & Deployment Scripts

### NPM Scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "dev": "react-scripts start",
    "start:backend": "node server.js",
    "dev:backend": "nodemon server.js",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "dev:full": "concurrently \"npm run dev:backend\" \"npm run dev\""
  }
}
```

### Docker Configuration
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/sportsdb
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 🔧 Development Environment Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+
- Python 3.9+ (for ML features)
- Git for version control

### Installation Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start MongoDB service
5. Run development servers: `npm run dev:full`

### Environment Variables
```bash
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sportsdb
JWT_SECRET=your-secret-key
NODE_ENV=development

# Frontend
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_CONFIG=your-firebase-config
```