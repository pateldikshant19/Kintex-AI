# 10 - Development Guide

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** and npm
- **MongoDB 5.0+** 
- **Python 3.9+** (for AI/ML features)
- **Git** for version control
- **VS Code** (recommended IDE)

### Installation Steps

#### 1. Clone and Setup
```bash
git clone <repository-url>
cd sport-analytics-platform
npm install
```

#### 2. Environment Configuration
Create `.env` file in root directory:
```bash
# Backend Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sportsdb
JWT_SECRET=your-super-secure-secret-key
NODE_ENV=development

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_CONFIG=your-firebase-config-json
```

#### 3. Database Setup
```bash
# Start MongoDB service
mongod --dbpath /path/to/your/db

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### 4. Start Development Servers
```bash
# Option 1: Start both servers simultaneously
npm run dev:full

# Option 2: Start servers separately
npm run dev:backend  # Terminal 1
npm run dev          # Terminal 2
```

#### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
sport-analytics-platform/
├── public/                 # Static files
│   └── index.html         # HTML template
├── src/                   # React source code
│   ├── components/        # React components
│   │   ├── Login.js      # Authentication
│   │   ├── Dashboard.js  # Main dashboard
│   │   ├── Analytics.js  # Analytics views
│   │   └── PlayerManagement.js
│   ├── services/         # API service layer
│   │   └── apiService.js # HTTP client
│   ├── App.js           # Main app component
│   ├── index.js         # App entry point
│   └── index.css        # Global styles
├── server.js            # Express backend server
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables
└── README.md           # Project documentation
```

## 🛠️ Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm run dev:full

# Commit changes
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Testing
```bash
# Run frontend tests
npm test

# Run backend tests (if configured)
npm run test:backend

# Run all tests
npm run test:all
```

### 3. Building for Production
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 🔧 Common Development Tasks

### Adding New API Endpoints
1. Define route in `server.js`
2. Add authentication middleware if needed
3. Implement business logic
4. Update API documentation
5. Add corresponding frontend service calls

### Creating New Components
1. Create component file in `src/components/`
2. Import and use in parent components
3. Add routing if needed in `App.js`
4. Style with Tailwind CSS classes

### Database Operations
```javascript
// Example: Adding new collection
const newSchema = new mongoose.Schema({
  field1: String,
  field2: Number,
  createdAt: { type: Date, default: Date.now }
});

const NewModel = mongoose.model('NewModel', newSchema);
```

### Environment Management
```bash
# Development
NODE_ENV=development npm run dev:backend

# Production
NODE_ENV=production npm start
```

## 🐛 Debugging

### Backend Debugging
```bash
# Enable debug logs
DEBUG=app:* npm run dev:backend

# Use nodemon for auto-restart
npm run dev:backend
```

### Frontend Debugging
- Use React Developer Tools browser extension
- Check browser console for errors
- Use `console.log()` for debugging
- Inspect network requests in DevTools

### Database Debugging
```bash
# Connect to MongoDB shell
mongo

# Show databases
show dbs

# Use specific database
use sportsdb

# Show collections
show collections

# Query data
db.users.find()
```

## 📝 Code Style Guidelines

### JavaScript/React
- Use ES6+ features
- Functional components with hooks
- Consistent naming conventions
- Proper error handling
- Comment complex logic

### CSS/Styling
- Use Tailwind CSS utility classes
- Responsive design principles
- Consistent spacing and colors
- Mobile-first approach

### API Design
- RESTful conventions
- Consistent response formats
- Proper HTTP status codes
- Input validation
- Error handling

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Security review completed
- [ ] Performance testing done

### Production Setup
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Monitoring and logging setup
- [ ] Error tracking implemented
- [ ] CDN configured for static assets