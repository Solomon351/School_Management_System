# School Management System API

## Setup

1. Open a terminal in the `backend` folder.
2. Install the backend dependencies with `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` in `.env` to your MongoDB connection string. Keep the real value private.
5. Start the development server with `npm run dev`, or use `npm start` for a normal start.

The server listens on port `5000` by default. Set `PORT` in `.env` to use another port.

## Health check

Once the server is running, request `http://localhost:5000/api/v1/health`. The response reports whether the API is up and whether its MongoDB connection is connected.

In development, CORS allows requests from any origin so the frontend can run from disk or a local server. Restrict allowed origins before launch.
