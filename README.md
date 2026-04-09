# YouTube Clone — React + TailwindCSS + Firebase

A fully functional YouTube clone built with React 18, TailwindCSS, Redux Toolkit, React Query, and Firebase.

## Features
- 🏠 Home page with trending videos + category filter pills
- 🔍 Search with debouncing (300ms) + voice search (Web Speech API)
- 📺 Watch page with YouTube player, video info, like/save actions
- 💬 Comments section with infinite scroll
- 📺 Related videos sidebar
- 📺 Channel page with banner, stats, videos
- 🕐 Watch history (Firebase)
- 👍 Liked videos (Firebase)
- 🕒 Watch later (Firebase)
- 🔒 Google authentication (Firebase)
- ♾️ Infinite scroll on all pages
- 💀 Skeleton loaders

## Setup

### 1. Clone and install
```bash
npm install
```

### 2. Create your `.env` file
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### 3. Get your YouTube API key
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a project → Enable **YouTube Data API v3**
- Credentials → Create API Key
- Paste into `VITE_YOUTUBE_API_KEY`

### 4. Setup Firebase
- Go to [Firebase Console](https://console.firebase.google.com)
- Create project → Add web app
- Enable **Authentication** → Google provider
- Enable **Firestore Database** (start in test mode)
- Copy config values into your `.env`

### 5. Run
```bash
npm run dev
```

## Project Structure
```
src/
├── config/         Firebase, React Query, constants
├── services/       YouTube API + Firebase service functions
├── store/          Redux slices (auth, ui, search)
├── hooks/          API hooks (React Query) + Firebase hooks + utils
├── context/        AuthContext
├── components/     UI components (layout, video, player, comments, auth)
├── pages/          Home, Watch, Search, Channel, History, Liked, WatchLater
└── utils/          Formatters, query keys
```

## API Quota Notes
- Daily free quota: **10,000 units**
- `search.list` = 100 units (debounced to protect quota)
- `videos.list` = 1 unit (trending, details)
- `commentThreads.list` = 1 unit
- All results cached with React Query (30 min for trending)
