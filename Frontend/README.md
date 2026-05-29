# CompanionConnect - Frontend

CompanionConnect is a modern companion booking platform built with React, Vite, and Tailwind CSS. It features a sleek, SaaS-style dashboard for browsing companions, managing bookings, and real-time chatting.

## Features

- **Browse Companions**: Responsive grid with filtering and search.
- **Companion Profiles**: Detailed profiles with interests, ratings, and availability.
- **Booking System**: Send and manage booking requests (Accept/Decline).
- **Real-time Chat**: Messaging interface for confirmed bookings.
- **User Dashboard**: Manage your profile and companion settings.
- **Authentication**: Integrated with Flask-Login session-based auth.

## Tech Stack

- **Frontend**: React (Vite), JavaScript, Tailwind CSS, React Router, Axios, Lucide Icons, Motion.
- **Backend (Expected)**: Flask, Flask-Login, Flask-CORS, SQLAlchemy.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 3. Setup Backend

The frontend is configured to communicate with a Flask backend at `http://localhost:5000/api`. 

**For detailed backend setup instructions, see [BACKEND_SETUP.md](./BACKEND_SETUP.md).**

## Project Structure

- `src/api/`: API integration layer using Axios.
- `src/components/`: Reusable UI components and route guards.
- `src/context/`: Authentication context and global state.
- `src/pages/`: Page layouts and logic.
- `src/index.css`: Tailwind configuration and custom animations.

## Authentication

This application uses **Flask session cookies** for authentication. 
- **No JWT or localStorage tokens** are used.
- All API requests include `withCredentials: true`.
- Ensure your backend is configured to allow cross-origin credentials.

## License

SPDX-License-Identifier: Apache-2.0
