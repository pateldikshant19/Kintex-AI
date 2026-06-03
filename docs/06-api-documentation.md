# 06 - API Documentation

## 🔌 RESTful API Endpoints

### Authentication Endpoints

#### POST /api/signup
**Purpose**: Creates new user account with sport and role
```javascript
// Request Body
{
  name: String,
  email: String,
  password: String,
  role: String, // 'manager', 'athlete', 'analyst'
  sport: String // 'football', 'cricket', 'track_and_field'
}

// Response
{
  message: String,
  user: Object,
  token: String
}
```

#### POST /api/login
**Purpose**: Validates credentials and returns user data
```javascript
// Request Body
{
  email: String,
  password: String
}

// Response
{
  message: String,
  user: Object,
  token: String
}
```

### Player Management Endpoints

#### GET /api/players
**Purpose**: Retrieves filtered player list
```javascript
// Query Parameters
?sport=football&managerId=123

// Response
{
  players: Array,
  count: Number
}
```

#### POST /api/players
**Purpose**: Creates new player record
```javascript
// Request Body
{
  name: String,
  position: String,
  sport: String,
  physicalStats: Object
}
```

#### PUT /api/players/:id
**Purpose**: Updates player information
```javascript
// Request Body
{
  name: String,
  position: String,
  // ... other updatable fields
}
```

#### DELETE /api/players/:id
**Purpose**: Removes player from system

### Analytics Endpoints

#### GET /api/analytics/:playerId
**Purpose**: Player performance analytics
```javascript
// Query Parameters
?timeframe=30days&metrics=all

// Response
{
  playerId: String,
  timeframe: String,
  performance: Array,
  summary: Object
}
```

#### GET /api/performance/:timeline
**Purpose**: Performance data by timeline
```javascript
// Response
{
  timeline: String,
  data: Array,
  trends: Object
}
```

### AI/ML Endpoints

#### GET /api/ai/performance
**Purpose**: Performance score prediction
```javascript
// Query Parameters
?playerId=123

// Response
{
  score: Number,
  trend: Number,
  confidence: Number,
  timestamp: Date
}
```

#### GET /api/ai/injury-risk
**Purpose**: Injury risk assessment
```javascript
// Response
{
  level: String, // 'Low', 'Medium', 'High'
  score: Number,
  factors: Array,
  confidence: Number
}
```

#### POST /api/ai/recommendations
**Purpose**: Coaching recommendations
```javascript
// Request Body
{
  playerId: String,
  context: Object
}

// Response
{
  recommendations: Array,
  generatedAt: Date
}
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Handling
Standard HTTP status codes with JSON error responses:
```javascript
{
  error: String,
  message: String,
  statusCode: Number
}
```