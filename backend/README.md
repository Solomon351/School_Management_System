# School Management System API

## Setup

1. Open a terminal in the `backend` folder.
2. Install the backend dependencies with `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` in `.env` to your MongoDB connection string. Keep the real value private.
5. Set `JWT_SECRET` to a long, random value before using login.
6. To create the first admin, set `SEED_ADMIN_NAME`, `SEED_ADMIN_LOGIN_ID`, and `SEED_ADMIN_PASSWORD` in `.env`, then run `npm run seed:admin`. The initial password must be changed after login. The seed command will not create another admin if one already exists.
7. Start the development server with `npm run dev`, or use `npm start` for a normal start.

The server listens on port `5000` by default. Set `PORT` in `.env` to use another port.

## Health check

Once the server is running, request `http://localhost:5000/api/v1/health`. The response reports whether the API is up and whether its MongoDB connection is connected.

In development, CORS allows requests from any origin so the frontend can run from disk or a local server. Restrict allowed origins before launch.

## Authentication

- `POST /api/v1/auth/login` accepts `{ "identifier": "ID, email, or phone", "password": "..." }`. It also accepts `email` or `loginId` instead of `identifier`. A successful response contains a Bearer token and public user details; password hashes are never returned.
- `GET /api/v1/auth/me` requires `Authorization: Bearer <token>` and returns the signed-in user's public details.
- `POST /api/v1/auth/change-password` requires `Authorization: Bearer <token>` and accepts `{ "currentPassword": "...", "newPassword": "..." }`. Passwords must be at least 8 characters and no more than 72 UTF-8 bytes.
- `GET /api/v1/admin/ping` requires an admin Bearer token and checks that the protected admin API is reachable.
- Protected routes use the `authenticate` and `requireRole` middleware in `src/middleware/auth.js`.
- Opening `/api/v1/auth/login` in a browser sends a `GET`; login must be tested with a `POST` request and a JSON body. A GET request to that URL returns `405 Method Not Allowed` with this guidance.

API errors use `{ "success": false, "message": "..." }`. Internal errors are reported without exposing stack traces.
