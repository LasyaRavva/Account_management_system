# Account Management System

A full stack account management application with JWT-based authentication, balance tracking, peer-to-peer transfers, and account statement visualization.

## Tech Stack

- Frontend: React, React Router, Context API, Axios, Vite
- Backend: Node.js, Express.js, JWT, bcryptjs
- Database: Supabase PostgreSQL

## Project Structure

```text
Account Management System/
├── frontend
└── backend
```

## Features

- User signup and login
- Automatic ₹10,000 opening balance for every new account
- JWT-protected backend routes
- Dashboard with current balance and recent transactions
- Send money flow between registered users
- Account statement table with credit and debit color coding
- Stored session in localStorage
- Loading and error states across the UI

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure Supabase

1. Create a Supabase project.
2. Open the SQL editor.
3. Run the SQL script in [backend/sql/schema.sql](backend/sql/schema.sql).
4. Copy [backend/.env.example](backend/.env.example) to `backend/.env` and fill in the values.
5. Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env` and set the API URL if needed.

Use the Supabase service role key in the backend so the API can execute the transfer RPC and protected table operations safely from the server.

### 3. Start the apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## API Routes

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Account

- `GET /api/account/balance`
- `GET /api/account/statement`
- `POST /api/account/transfer`
- `GET /api/users`

## Transfer Logic

Transfers are handled through the PostgreSQL function `transfer_funds` defined in [backend/sql/schema.sql](backend/sql/schema.sql). The function:

- Locks both accounts during the transfer
- Verifies that the receiver exists
- Checks the sender balance before deduction
- Updates both balances atomically
- Inserts two transaction entries per transfer
- Stores the balance after each entry for statement rendering

## Submission

The codebase is ready to commit to a GitHub repository. The final repository creation, commit, and push still need to be run in your own Git environment.
