# Discord Clone

A real-time messaging app inspired by Discord. Create an account, join channels, and chat with others instantly.

## Features

- User registration and login
- Multiple chat channels
- Real-time messaging with Socket.io
- Create new channels
- Simple Discord-style UI

## Tech Stack

| Layer    | Technologies                         |
| -------- | ------------------------------------ |
| Frontend | React, Vite, Axios, Socket.io-client |
| Backend  | Express, Socket.io, JWT, bcrypt      |
| Database | MongoDB (Atlas)                      |
| Styling  | Pure CSS                             |

## Prerequisites

- Node.js v18+
- MongoDB Atlas cluster (or local MongoDB)

## Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/Anan631/DIscord-Clone.git
   cd DIscord-Clone
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Configure the server**

   Copy `server/.env.example` to `server/.env` and set:

   ```
   PORT=5000
   MONGODB_URI=your-atlas-connection-string
   JWT_SECRET=your-secret-key
   ```

4. **Run the app** (two terminals)

   ```bash
   npm run dev:server
   npm run dev:client
   ```

5. Open **http://localhost:5173**

## Usage

1. Sign up with a username, email, and password
2. Select a channel from the sidebar (e.g. `#general`)
3. Send messages — they appear in real time for everyone in that channel
4. Click **+** in the sidebar to create a new channel

## Project Structure

```
Discord App/
├── client/          # React frontend
├── server/          # Express API + Socket.io
└── README.md
```

## License

MIT
