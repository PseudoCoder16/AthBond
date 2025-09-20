# 🏗️ Project Structure

This directory contains the modular backend structure for the Sports Athlete Platform.

## 📁 Directory Structure

```
src/
├── config/           # Configuration files
│   ├── database.js   # Database configuration and helpers
│   ├── session.js    # Session configuration
│   └── upload.js     # File upload configuration
├── controllers/      # Request handlers
│   ├── authController.js    # Authentication logic
│   ├── athleteController.js # Athlete-specific logic
│   └── coachController.js   # Coach-specific logic
├── middleware/       # Custom middleware
│   ├── auth.js       # Authentication middleware
│   └── validation.js # Input validation middleware
├── routes/          # Route definitions
│   ├── authRoutes.js    # Authentication routes
│   ├── athleteRoutes.js # Athlete API routes
│   ├── coachRoutes.js   # Coach API routes
│   └── pageRoutes.js    # Page serving routes
├── services/        # Business logic
│   ├── athleteService.js # Athlete data operations
│   ├── coachService.js   # Coach data operations
│   └── aiService.js      # AI/ML processing
└── utils/           # Utility functions
```

## 🔧 Configuration Files

### `config/database.js`
- Database connection and helper functions
- File-based storage for athletes and coaches
- CRUD operations for user data

### `config/session.js`
- Express session configuration
- Environment-based security settings

### `config/upload.js`
- Multer configuration for file uploads
- Video file validation and storage

## 🎮 Controllers

### `controllers/authController.js`
- Handles authentication logic
- Login/signup for athletes and coaches
- Session management

### `controllers/athleteController.js`
- Athlete profile management
- Video upload and AI processing
- Stats and leaderboard data

### `controllers/coachController.js`
- Coach profile management
- Athlete monitoring and alerts
- Performance analytics

## 🛡️ Middleware

### `middleware/auth.js`
- Authentication checks
- Route protection
- User type validation

### `middleware/validation.js`
- Input validation
- Data sanitization
- Error handling

## 🛣️ Routes

### `routes/authRoutes.js`
- Authentication endpoints
- Login/signup routes

### `routes/athleteRoutes.js`
- Athlete API endpoints
- Video processing routes

### `routes/coachRoutes.js`
- Coach API endpoints
- Monitoring and analytics routes

### `routes/pageRoutes.js`
- Static page serving
- Route protection

## 🔧 Services

### `services/athleteService.js`
- Athlete business logic
- Data operations
- Statistics calculation

### `services/coachService.js`
- Coach business logic
- Athlete management
- Alert generation

### `services/aiService.js`
- AI/ML processing
- Video analysis
- Pose detection simulation

## 🚀 Usage

The main application entry point is `app.js`, which:
1. Configures Express middleware
2. Sets up routes
3. Handles errors
4. Exports the configured app

The server is started from `server.js` which imports and runs the app.

## 🔄 Benefits of This Structure

1. **Separation of Concerns**: Each module has a single responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Scalability**: Simple to add new features or modify existing ones
4. **Testability**: Each module can be tested independently
5. **Readability**: Clear organization makes code easier to understand
6. **Reusability**: Services and middleware can be reused across routes
