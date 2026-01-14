# Spotify-like Music Player

A full-stack music streaming web application inspired by Spotify, featuring user authentication, music upload, playlist management, and real-time audio streaming.

## 🎵 Features

### Frontend
- **Modern UI**: Spotify-inspired dark theme with smooth animations
- **Music Player**: Full-featured player with play/pause, next/previous, shuffle, repeat
- **Progress Controls**: Draggable progress bar and volume control
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Shortcuts**: Space (play/pause), Arrow keys (seek/volume)
- **Real-time Playback**: Actual audio streaming from backend

### Backend
- **User Authentication**: Secure JWT-based login/signup system
- **Music Upload**: Upload your own audio files (MP3, WAV, OGG, M4A, FLAC)
- **Audio Streaming**: Efficient streaming with range request support
- **Playlist Management**: Create, edit, and manage custom playlists
- **Like Songs**: Save favorite tracks
- **User Preferences**: Persistent settings (volume, shuffle, repeat)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and JWT secret:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spotify-clone
JWT_SECRET=your-secret-key-here
```

5. Start MongoDB (if local):
```bash
mongod
```

6. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Open `index.html` in a web browser, or serve with a simple HTTP server:
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080
```

2. Open `http://localhost:8080` in your browser

3. The frontend will automatically connect to the backend at `http://localhost:5000`

## 📁 Project Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # Spotify-inspired styling
├── script.js           # Frontend player logic + backend integration
├── api.js              # API client for backend communication
├── backend/            # Backend Node.js server
│   ├── server.js       # Express server setup
│   ├── models/         # MongoDB models (User, Song, Playlist)
│   ├── routes/         # API routes (auth, songs, playlists)
│   ├── middleware/     # Authentication middleware
│   ├── uploads/        # Uploaded audio files
│   └── package.json    # Backend dependencies
└── historia/           # Original Historia project (preserved)
```

## 🔐 Authentication

### Register
1. Click on "Login" in the top-right corner
2. Click "Sign up"
3. Enter username, email, and password
4. You'll be automatically logged in

### Login
1. Click on "Login" in the top-right corner
2. Enter your email and password
3. Click "Log In"

## 🎶 Uploading Music

1. Log in to your account
2. Click "Upload Song" button in the sidebar
3. Select an audio file and fill in details:
   - Song Title (required)
   - Artist (required)
   - Album (optional)
   - Genre (optional)
4. Click "Upload"

Supported formats: MP3, WAV, OGG, M4A, FLAC (max 50MB)

## 📝 Creating Playlists

1. Log in to your account
2. Click "Create Playlist" button
3. Enter playlist name and description
4. Choose public/private visibility
5. Click "Create"

## 🎨 UI Features

- **Sidebar Navigation**: Home, Search, Your Library
- **Featured Playlists**: Quick access to top content
- **Made for You**: Personalized recommendations
- **Now Playing**: Current track info with album art
- **Player Controls**: Full playback control bar at bottom
- **Like Songs**: Heart icon to save favorites
- **User Profile**: Access account and logout

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PATCH /api/auth/preferences` - Update preferences

### Songs
- `POST /api/songs/upload` - Upload song
- `GET /api/songs` - Get all songs
- `GET /api/songs/:id/stream` - Stream song
- `POST /api/songs/:id/like` - Like/unlike song

### Playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/my` - Get user playlists
- `POST /api/playlists/:id/songs` - Add song to playlist

See `backend/README.md` for complete API documentation.

## 🛠️ Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- CSS Grid & Flexbox for layout
- Font Awesome for icons
- Web Audio API for playback

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- Multer for file uploads
- bcrypt for password hashing
- music-metadata for audio metadata extraction

## 🌐 Deployment

### Frontend
- Can be deployed to GitHub Pages, Netlify, Vercel, etc.
- Update `API_BASE_URL` in `api.js` to your backend URL

### Backend
- Deploy to Heroku, Railway, Render, or any Node.js hosting
- Use MongoDB Atlas for database
- Set environment variables on hosting platform
- For production, use cloud storage (S3, GCS) for uploads

## 🔒 Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- Protected API routes
- Input validation
- File type validation for uploads
- CORS configured

## 📱 Responsive Design

The application is fully responsive:
- **Desktop (>768px)**: Full sidebar and all features
- **Mobile (<768px)**: Simplified layout, hidden sidebar

## ⌨️ Keyboard Shortcuts

- `Space`: Play/Pause
- `Arrow Right`: Skip forward 5 seconds
- `Arrow Left`: Skip backward 5 seconds
- `Arrow Up`: Increase volume
- `Arrow Down`: Decrease volume

## 🐛 Troubleshooting

### Frontend not connecting to backend
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify `API_BASE_URL` in `api.js`

### Upload failing
- Check file size (max 50MB)
- Verify audio format is supported
- Ensure you're logged in

### MongoDB connection error
- Start MongoDB: `mongod`
- Check connection string in `.env`
- For Atlas, whitelist your IP

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 👨‍💻 Development

### Run Backend
```bash
cd backend
npm run dev
```

### Run Frontend
```bash
python3 -m http.server 8080
# or
npx http-server -p 8080
```

## 🎯 Future Enhancements

- [ ] Search functionality
- [ ] Artist profiles
- [ ] Album view
- [ ] Social features (follow users, share playlists)
- [ ] Music recommendations
- [ ] Real-time collaboration on playlists
- [ ] Mobile app
- [ ] Lyrics display
- [ ] Equalizer

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Note**: The original Historia tourism project is preserved in the `/historia` folder.