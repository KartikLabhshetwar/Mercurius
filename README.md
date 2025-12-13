# Mercurius

A private, self-destructing chat room application built with Next.js and real-time messaging. Rooms automatically expire after 10 minutes, ensuring ephemeral conversations.

## Features

- **Self-Destructing Rooms**: Chat rooms automatically expire after 10 minutes
- **Real-Time Messaging**: Instant message delivery using Upstash Realtime
- **Private & Ephemeral**: No persistent storage; all data is cleared after expiration
- **Room Management**: Create rooms, share links, and manually destroy rooms
- **Username System**: Simple username-based identification
- **Modern UI**: Built with COSS UI components and Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library with React Compiler enabled
- **TanStack Query** - Server state management and data fetching
- **COSS UI** - Accessible component primitives
- **Tailwind CSS 4** - Utility-first styling
- **TypeScript** - Type safety

### Backend
- **Elysia** - Fast Bun-based web framework
- **Upstash Redis** - Serverless Redis for data storage
- **Upstash Realtime** - Real-time pub/sub messaging
- **Eden Treaty** - Type-safe API client generation

### Infrastructure
- **Bun** - Runtime and package manager
- **Zod** - Schema validation

## Architecture

### Overview

Mercurius follows a serverless architecture pattern:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js   │─────▶│  Elysia API  │─────▶│   Upstash   │
│   Client    │      │   Routes     │      │   Redis     │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     │                      │
       │                     │                      │
       └─────────────────────┼──────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Upstash Realtime│
                    └─────────────────┘
```

### Data Flow

1. **Room Creation**: Client requests room creation → API generates room ID → Redis stores metadata with TTL
2. **Message Sending**: Client sends message → API validates → Stores in Redis → Emits via Realtime → All clients receive update
3. **Real-Time Updates**: Upstash Realtime publishes events → Clients subscribed to room channel receive updates
4. **Expiration**: Redis TTL expires → Room data is automatically cleaned up

### Key Design Decisions

**Why Elysia in Next.js API routes?**
- Type-safe API with Eden Treaty for end-to-end type safety
- Fast runtime with Bun
- Clean separation of concerns while staying in monorepo

**Why Upstash Redis + Realtime?**
- Serverless architecture - no infrastructure management
- Built-in TTL support for automatic expiration
- Integrated real-time pub/sub without additional services
- Global edge network for low latency

**Why TanStack Query?**
- Automatic refetching on window focus
- Optimistic updates support
- Built-in loading and error states
- Cache invalidation strategies

## Getting Started

### Prerequisites

- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh))
- **Upstash Account** - For Redis and Realtime services
- **Node.js** 20+ (if not using Bun)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KartikLabhshetwar/Mercurius
cd Mercurius
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
UPSTASH_REALTIME_URL=your_realtime_url
UPSTASH_REALTIME_TOKEN=your_realtime_token
```

Get these values from your [Upstash Console](https://console.upstash.com/).

4. Run the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Mercurius/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes (Elysia handlers)
│   │   └── [[...slugs]]/     # Catch-all route for Elysia
│   ├── room/                 # Room pages
│   │   └── [roomId]/         # Dynamic room route
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── ui/                   # Base UI components
│   ├── message-*.tsx         # Message-related components
│   ├── room-header.tsx       # Room header with controls
│   └── countdown-timer.tsx   # TTL countdown display
├── hooks/                    # Custom React hooks
│   ├── use-username.ts       # Username management
│   └── use-mobile.ts         # Mobile detection
├── lib/                      # Core utilities
│   ├── client.ts             # Eden Treaty API client
│   ├── realtime.ts           # Realtime setup
│   ├── realtime-client.ts    # Client-side realtime hook
│   ├── redis.ts              # Redis client
│   ├── schemas.ts            # Zod schemas
│   └── utils.ts              # Shared utilities
└── proxy.ts                  # Development proxy (if needed)
```

## Development

### Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint

### Development Workflow

1. **API Development**: Edit files in `app/api/[[...slugs]]/route.ts`
   - Elysia routes are type-safe and auto-validated
   - Eden Treaty generates client types automatically

2. **Component Development**: Edit files in `components/`
   - Use COSS UI primitives for accessibility
   - Follow existing patterns for consistency

3. **Real-Time Testing**: 
   - Open multiple browser windows/tabs
   - Create a room and share the URL
   - Messages should appear instantly across all clients

### Type Safety

The project uses end-to-end type safety:

- **Zod schemas** define data structures
- **Elysia** validates requests/responses
- **Eden Treaty** generates typed client
- **TypeScript** ensures compile-time safety

Changes to API schemas automatically propagate to the client.

## Production Considerations

### Environment Variables

Ensure all Upstash credentials are set in your deployment platform:
- Vercel: Use Environment Variables in project settings
- Other platforms: Follow their environment variable configuration

### Redis Configuration

- **TTL Strategy**: Rooms expire after 10 minutes (600 seconds)
- **Data Structure**: 
  - `meta:{roomId}` - Room metadata (Hash)
  - `messages:{roomId}` - Message list (List)
- **Cleanup**: Automatic via Redis TTL, manual via DELETE endpoint

### Performance

- **Redis**: Serverless, scales automatically
- **Realtime**: Edge-distributed, low latency globally
- **Next.js**: Static optimization where possible
- **React Compiler**: Enabled for automatic optimizations

### Security

- **Room Access**: Room IDs are unguessable (nanoid)
- **No Authentication**: By design - rooms are ephemeral
- **Input Validation**: All inputs validated via Zod schemas
- **Rate Limiting**: Consider adding for production (not implemented)

### Monitoring

Consider adding:
- Upstash Redis metrics (available in console)
- Error tracking (Sentry, etc.)
- Analytics (optional, privacy-conscious)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Vercel automatically detects Next.js and configures build settings.

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Ensure Bun runtime is available (or use Node.js)
- Set all required environment variables
- Configure build command: `bun run build`
- Configure start command: `bun run start`

## Limitations & Future Improvements

### Current Limitations

- No user authentication
- No message history persistence
- No file/image sharing
- No typing indicators
- No read receipts
- 10-minute TTL is hardcoded

### Potential Enhancements

- Configurable room TTL
- Password-protected rooms
- Message reactions
- User avatars
- Room themes
- Export chat history
- Mobile app (React Native)

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

