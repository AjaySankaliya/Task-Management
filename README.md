# Task Management

## Live Project

**[https://task-management-silk-three.vercel.app/](https://task-management-silk-three.vercel.app/)**

A full-stack task and project management application with a Next.js frontend and an Express + MongoDB backend.

## Project Structure

- `client/` - Next.js frontend application
- `server/` - Express backend API with TypeScript and Mongoose

## Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB instance (local or cloud)

## Setup

### 1. Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` with the following environment variables:

```env
MONGO_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_jwt_secret
PORT=5000
```

> Adjust `MONGO_URI` to match your MongoDB host or cloud connection string.

### 2. Frontend

```bash
cd ../client
npm install
```

If your frontend needs environment variables, create a `.env.local` in `client/` and add any required values. For example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Run Locally

### Backend

From `server/`:

```bash
npm run dev
```

This starts the backend API in development mode using `ts-node-dev`.

### Frontend

From `client/`:

```bash
npm run dev
```

This starts the Next.js development server. Open the app at `http://localhost:3000`.

## Build and Production

### Backend build

From `server/`:

```bash
npm run build
npm start
```

### Frontend build

From `client/`:

```bash
npm run build
npm start
```

## Available Scripts

### Client

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the Next.js app for production
- `npm run start` - Start the production Next.js app
- `npm run lint` - Run ESLint

### Server

- `npm run dev` - Start the Express server in development
- `npm run build` - Compile the TypeScript backend
- `npm start` - Run the compiled backend

## Notes

- Frontend routes are organized under `client/src/app/`, including dashboard and auth flows.
- Backend API controllers and routes are in `server/src/controllers` and `server/src/routes`.
- Use valid JWT secret values to enable authentication.

## Recommended Workflow

1. Start MongoDB.
2. Run backend from `server/`.
3. Run frontend from `client/`.
4. Open the browser at `http://localhost:3000`.

## Troubleshooting

- If the frontend cannot connect to the backend, verify `NEXT_PUBLIC_API_BASE_URL` and backend port.
- If authentication fails, ensure `JWT_SECRET` is set and matches any stored tokens.
- If MongoDB connection fails, verify `MONGO_URI` and database availability.
