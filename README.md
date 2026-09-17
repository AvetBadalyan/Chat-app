# Avetbook

A real-time chat application built with the MERN stack and Socket.io.

**[Live Demo](https://avetbook-chat-app.onrender.com)** — Try the demo account
to explore features instantly.

![Avetbook Chat Interface](./screenshots/01-landing-dark.png)

## Features

- **Real-time messaging** — Instant message delivery using WebSocket connections
- **Typing indicators** — See when someone is typing with debounced events
- **Message reactions** — React to messages with emoji (👍 ❤️ 😂 😮 😢 😡)
- **Unread message badges** — Track unread conversations with visual indicators
- **Online presence** — Live status showing who's currently online
- **Image sharing** — Send images with Cloudinary storage integration
- **Light/Dark theme** — Toggle between light and dark mode
- **Secure authentication** — JWT-based auth with HTTP-only cookies
- **Responsive design** — Works on desktop, tablet, and mobile

## Tech Stack

| Layer     | Technology                                     |
| --------- | ---------------------------------------------- |
| Frontend  | React 19, Vite, Zustand, Tailwind CSS, DaisyUI |
| Backend   | Node.js, Express 5                             |
| Database  | MongoDB with Mongoose                          |
| Real-time | Socket.io                                      |
| Storage   | Cloudinary (images)                            |
| Auth      | JWT with HTTP-only cookies, bcrypt             |

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│                 │◄──────────────────►│                 │
│  React Client   │                    │  Express Server │
│  (Zustand)      │     REST API       │  (Socket.io)    │
│                 │◄──────────────────►│                 │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │    MongoDB      │
                                       │   + Cloudinary  │
                                       └─────────────────┘
```

### Key Design Decisions

**Global Socket Subscription**  
Socket events are subscribed once on authentication, not per conversation. This
allows tracking messages from all users (for unread badges) rather than only the
selected conversation.

**Optimistic UI with Real-time Sync**  
Reactions and typing indicators update instantly via Socket.io events. The
sender makes an API call, and the server broadcasts to all relevant parties.

**State Management with Zustand**  
Two stores separate concerns: `useAuthStore` (auth + socket + online users),
`useChatStore` (messages + users + typing). Theme preference is stored in
`useThemeStore` with localStorage persistence.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://...
PORT=5001
JWT_SECRET=your-secret-key

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

NODE_ENV=development
```

### Installation

```bash
# Install dependencies for both frontend and backend
npm run build

# Start development servers (backend + frontend)
npm run dev
```

- Backend: http://localhost:5001
- Frontend: http://localhost:5173

### Seed Demo Data

```bash
cd backend
npm run seed
```

This creates a demo account (`demo@avetbook.com` / `demo123456`) and sample
users.

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── lib/             # Utilities (db, socket, cloudinary)
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   └── seeds/           # Database seeders
│   └── index.js
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Route pages
│   │   ├── store/           # Zustand stores
│   │   └── lib/             # Axios instance, utilities
│   └── index.html
```

## API Endpoints

### Authentication

| Method | Endpoint                   | Description            |
| ------ | -------------------------- | ---------------------- |
| POST   | `/api/auth/signup`         | Create account         |
| POST   | `/api/auth/login`          | Login                  |
| POST   | `/api/auth/logout`         | Logout                 |
| GET    | `/api/auth/check`          | Verify auth status     |
| PUT    | `/api/auth/update-profile` | Update profile picture |

### Messages

| Method | Endpoint                         | Description         |
| ------ | -------------------------------- | ------------------- |
| GET    | `/api/messages/users`            | Get all users       |
| GET    | `/api/messages/:userId`          | Get conversation    |
| POST   | `/api/messages/send/:userId`     | Send message        |
| POST   | `/api/messages/react/:messageId` | Add/remove reaction |

### Socket Events

| Event               | Direction       | Description               |
| ------------------- | --------------- | ------------------------- |
| `newMessage`        | Server → Client | New message received      |
| `messageReaction`   | Server → Client | Reaction added/removed    |
| `typing`            | Client → Server | User started typing       |
| `stopTyping`        | Client → Server | User stopped typing       |
| `userTyping`        | Server → Client | Someone is typing         |
| `userStoppedTyping` | Server → Client | Someone stopped typing    |
| `getOnlineUsers`    | Server → Client | Online users list updated |

## Screenshots

### Desktop

| Landing Page (Dark)                                | Landing Page (Light)                                 |
| -------------------------------------------------- | ---------------------------------------------------- |
| ![Landing Dark](./screenshots/01-landing-dark.png) | ![Landing Light](./screenshots/02-landing-light.png) |

| Sign Up                                | Login                                |
| -------------------------------------- | ------------------------------------ |
| ![Signup](./screenshots/03-signup.png) | ![Login](./screenshots/04-login.png) |

| Chat Home                                    | Chat Conversation                                            |
| -------------------------------------------- | ------------------------------------------------------------ |
| ![Chat Home](./screenshots/05-chat-home.png) | ![Chat Conversation](./screenshots/06-chat-conversation.png) |

| Profile                                  |
| ---------------------------------------- |
| ![Profile](./screenshots/07-profile.png) |

### Mobile

| Landing                                                | Chat List                                        | Conversation                                                     |
| ------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------- |
| ![Mobile Landing](./screenshots/08-mobile-landing.png) | ![Mobile Chat](./screenshots/09-mobile-chat.png) | ![Mobile Conversation](./screenshots/10-mobile-conversation.png) |

## License

MIT
