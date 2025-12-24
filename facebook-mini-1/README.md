# Facebook Mini

A mini Facebook-like social media application with core social features.

## Features

- User authentication (register/login)
- News feed with posts from friends
- Create posts with text and images
- Like and comment on posts
- Friend requests and friend management
- User profiles

## Tech Stack

- **Frontend:** React, React Router, Axios, Vite
- **Backend:** Node.js, Express
- **Auth:** JWT, bcrypt

## Getting Started

1. Install dependencies:
```bash
npm run install-all
```

2. Start the application:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/posts` - Get feed posts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment
- `GET /api/friends` - Get friends list
- `POST /api/friend-requests` - Send friend request
- `POST /api/friend-requests/:id/accept` - Accept request
