# Express MSSQL

A Node.js backend application with authentication, database integration, and logging capabilities.

## Overview

This project is a RESTful API backend built with Express.js that connects to a Microsoft SQL Server database. It features user authentication using JWT (JSON Web Token), password hashing with bcrypt, request validation, and structured logging.

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MS SQL Server** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management
- **joi & express-validator** - Request validation
- **winston** - Logging
- **nodemon** - Development server with hot reload

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- NPM (v6 or higher)
- Microsoft SQL Server

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd express-mssql
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:

   ```
   PORT=3030
   JWT_SECRET=your_secret_key_here
   DB_SERVER=""
   DB_USER="sa"
   DB_PASSWORD=""
   DB_NAME=""
   DB_PORT="1433"
   ```

   Note: For production, make sure to use a strong, unique JWT_SECRET key.

## Database Setup

Ensure your MS SQL Server is running and accessible with the credentials provided in the `.env` file. You should create a database or change the DB_NAME variable to match your database name.

## Running the Application

### Development mode

```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts when changes are detected.

### Production mode

```bash
npm start
```

This will start the server using Node.js.

The server will run on the port specified in your `.env` file (default: 3030).

## Project Structure

```
/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   └── server.js       # Entry point
├── .env                # Environment variables
├── package.json        # Project dependencies
└── README.md           # This file
```

## API Endpoints

Document your API endpoints here. For example:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile (protected)

## Authentication

This project uses JWT for authentication. To access protected endpoints, include the JWT token in the request headers:

```
Authorization: Bearer <your-token>
```

## Validation

Request validation is handled using joi and express-validator. Input data is validated before processing to ensure data integrity and security.

## Logging

The application uses winston for logging. Logs are organized by severity levels (error, warn, info, etc.) for better monitoring and debugging.

## License

This project is licensed under the ISC License.
