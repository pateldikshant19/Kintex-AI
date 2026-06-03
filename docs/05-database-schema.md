# 05 - Database Schema

## 🗄️ MongoDB Collections

### 👤 Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  role: String, // 'manager', 'athlete', 'analyst'
  sport: String, // 'football', 'cricket', 'track_and_field'
  password: String (hashed),
  createdAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

### 🏃♂️ Players Collection
```javascript
{
  _id: ObjectId,
  name: String,
  sport: String,
  managerId: String,
  position: String,
  jerseyNumber: Number,
  dateOfBirth: Date,
  physicalStats: {
    height: Number,
    weight: Number,
    bodyFatPercentage: Number
  },
  performanceHistory: [{
    date: Date,
    metrics: Object,
    score: Number
  }],
  injuryHistory: [{
    date: Date,
    type: String,
    severity: String,
    recoveryTime: Number
  }],
  trainingData: [{
    date: Date,
    duration: Number,
    intensity: String,
    type: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 📊 Performance Collection
```javascript
{
  _id: ObjectId,
  playerId: ObjectId,
  sport: String,
  date: Date,
  metrics: {
    // Sport-specific metrics
    football: {
      goals: Number,
      assists: Number,
      passAccuracy: Number,
      distanceCovered: Number
    },
    cricket: {
      runs: Number,
      wickets: Number,
      strikeRate: Number,
      average: Number
    },
    trackField: {
      time: Number,
      distance: Number,
      personalBest: Boolean
    }
  },
  overallScore: Number,
  createdAt: Date
}
```

### 🏥 Injuries Collection
```javascript
{
  _id: ObjectId,
  playerId: ObjectId,
  type: String,
  severity: String, // 'minor', 'moderate', 'severe'
  bodyPart: String,
  dateOccurred: Date,
  expectedRecovery: Date,
  actualRecovery: Date,
  treatment: String,
  status: String, // 'active', 'recovering', 'recovered'
  createdAt: Date
}
```

## 🔄 Database Operations

### CREATE Operations
- User registration
- Player addition
- Performance data entry
- Injury record creation

### READ Operations
- User authentication
- Player data retrieval
- Performance analytics
- Dashboard data loading

### UPDATE Operations
- Profile modifications
- Performance updates
- Injury status changes
- Training log updates

### DELETE Operations
- Account deactivation
- Player removal
- Data cleanup
- Historical data archiving

## Indexing Strategy
- **Users**: email (unique), role, sport
- **Players**: managerId, sport, name
- **Performance**: playerId, date, sport
- **Injuries**: playerId, status, dateOccurred