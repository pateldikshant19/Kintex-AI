# Kinetix AI Platform

A modern React-based sports analytics application for tracking team performance, player statistics, and generating insights.

## Features

- **Dashboard**: Real-time overview of team performance
- **Player Management**: Track individual player stats and information
- **Analytics**: Deep dive into performance trends and insights
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions and API services
├── styles/        # CSS files
├── App.js         # Main app component
└── index.js       # Entry point
```

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:3001/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request