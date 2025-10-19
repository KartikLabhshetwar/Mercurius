# Mercurius - Secure Disposable Chat

A real-time chat application that allows users to create temporary, disposable chat rooms for secure and private conversations. Built with Node.js, Express, Socket.IO, React, and Vite.

## Features

- 🚀 **Real-time messaging** with WebSocket support
- 📱 **Media sharing** - Upload and share images and audio files
- 😀 **Emoji support** - Send emojis in your conversations
- 🔒 **Disposable rooms** - Rooms are automatically deleted when the creator leaves
- 👥 **Multi-user support** - Multiple participants can join the same room
- 🌐 **Cloud storage** - Media files are stored securely in Cloudinary
- 📱 **Responsive design** - Works on desktop and mobile devices
- ⚡ **Fast and lightweight** - Built with modern technologies

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **Cloudinary** - Cloud media storage
- **Multer** - File upload handling
- **UUID** - Unique room ID generation

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **TanStack Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Cloudinary account (for media storage)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KartikLabhshetwar/Mercurius.git
   cd Mercurius
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```env
   PORT=3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLIENT_URL=http://localhost:5173
   ```

   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_SOCKET_URL=http://localhost:3000
   ```

4. **Get Cloudinary credentials**
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Get your Cloud Name, API Key, and API Secret from the dashboard
   - Add them to your `backend/.env` file

## Usage

### Development

Start both backend and frontend servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- Frontend server on `http://localhost:5173`

### Production

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the backend**
   ```bash
   npm start
   ```

## How to Use

1. **Create a Room**
   - Enter a username
   - Click "Create Room"
   - Share the generated link with others

2. **Join a Room**
   - Enter a username
   - Paste the room link or enter the room ID
   - Click "Join Room"

3. **Chat Features**
   - Send text messages
   - Upload images and audio files
   - Send emojis
   - See who's online
   - Copy room link to share

4. **Room Management**
   - Room creator can delete the entire room
   - Any participant can leave the room
   - Rooms are automatically cleaned up when empty

## API Documentation

### REST Endpoints

#### Room Management

- `POST /api/room/create` - Create a new room
- `GET /api/room/:roomId` - Check if room exists
- `DELETE /api/room/:roomId` - Delete room (creator only)
- `GET /api/room/:roomId/participants` - Get room participants
- `GET /api/room/admin/rooms` - Get all active rooms (debug)

#### Media Upload

- `POST /api/media/upload` - Upload media file
- `DELETE /api/media/delete` - Delete media file

### Socket.IO Events

#### Client to Server

- `join-room` - Join a room with username
- `send-message` - Send text message
- `send-media` - Send media message
- `send-emoji` - Send emoji
- `leave-room` - Leave room
- `delete-room` - Delete room (creator only)

#### Server to Client

- `room-history` - Room messages and participants
- `user-joined` - User joined notification
- `user-left` - User left notification
- `receive-message` - New message received
- `room-deleted` - Room deleted notification
- `error` - Error message

## Project Structure

```
Mercurius/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── middleware/
│   │   └── upload.js
│   ├── routes/
│   │   ├── room.js
│   │   └── media.js
│   ├── services/
│   │   ├── roomService.js
│   │   └── mediaService.js
│   ├── socket/
│   │   └── chatHandler.js
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── RoomHeader.jsx
│   │   │   └── ParticipantsList.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   ├── useMessages.js
│   │   │   └── useRoom.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── ChatRoom.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── roomService.js
│   │   │   └── mediaService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Security Features

- **No persistent storage** - All data is stored in memory
- **Room-based isolation** - Users can only access rooms they join
- **File type validation** - Only allowed file types can be uploaded
- **File size limits** - Prevents large file uploads
- **CORS protection** - Cross-origin requests are controlled
- **Input validation** - All inputs are validated and sanitized

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [Cloudinary](https://cloudinary.com/) for media storage
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the build tool