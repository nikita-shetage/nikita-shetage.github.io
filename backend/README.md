# Spotify Clone Backend

Full-stack music streaming application backend with user authentication, file upload, and playlist management using MySQL.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Music Upload & Streaming**: Upload audio files with metadata extraction and streaming support
- **Playlist Management**: Create, update, and manage custom playlists
- **User Preferences**: Save and sync user settings (volume, shuffle, repeat)
- **Liked Songs**: Like/unlike functionality for songs

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **File Upload**: Multer with metadata extraction
- **Audio Streaming**: Range request support for efficient streaming

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MySQL configuration:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=spotify_clone
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Create the MySQL database:
```bash
mysql -u root -p
CREATE DATABASE spotify_clone;
exit;
```

6. Start the server (tables will be created automatically):
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` and automatically:
- Connect to MySQL
- Create all necessary tables (users, songs, playlists, user_liked_songs, playlist_songs)
- Sync the database schema

## Database Schema

### Tables

**users**
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- password (VARCHAR)
- profilePicture (VARCHAR)
- volume (FLOAT)
- shuffle (BOOLEAN)
- repeat (INT)
- createdAt, updatedAt (TIMESTAMP)

**songs**
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- title, artist, album (VARCHAR)
- duration (FLOAT)
- fileName, filePath (VARCHAR)
- coverImage, genre (VARCHAR)
- uploadedBy (INT, FOREIGN KEY -> users.id)
- plays (INT)
- createdAt, updatedAt (TIMESTAMP)

**playlists**
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR)
- description (TEXT)
- owner (INT, FOREIGN KEY -> users.id)
- coverImage (VARCHAR)
- isPublic (BOOLEAN)
- createdAt, updatedAt (TIMESTAMP)

**user_liked_songs** (junction table)
- userId (INT, FOREIGN KEY -> users.id)
- songId (INT, FOREIGN KEY -> songs.id)
- UNIQUE(userId, songId)

**playlist_songs** (junction table)
- playlistId (INT, FOREIGN KEY -> playlists.id)
- songId (INT, FOREIGN KEY -> songs.id)
- position (INT)
- UNIQUE(playlistId, songId)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PATCH /api/auth/profile` - Update user profile (authenticated)
- `PATCH /api/auth/preferences` - Update user preferences (authenticated)

### Songs

- `POST /api/songs/upload` - Upload a new song (authenticated)
- `GET /api/songs` - Get all songs (paginated)
- `GET /api/songs/:id` - Get single song details
- `GET /api/songs/:id/stream` - Stream a song (supports range requests)
- `DELETE /api/songs/:id` - Delete a song (authenticated, owner only)
- `POST /api/songs/:id/like` - Like/unlike a song (authenticated)
- `GET /api/songs/liked/all` - Get user's liked songs (authenticated)

### Playlists

- `POST /api/playlists` - Create new playlist (authenticated)
- `GET /api/playlists/my` - Get user's playlists (authenticated)
- `GET /api/playlists/public` - Get all public playlists (paginated)
- `GET /api/playlists/:id` - Get playlist details
- `PATCH /api/playlists/:id` - Update playlist (authenticated, owner only)
- `POST /api/playlists/:id/songs` - Add song to playlist (authenticated, owner only)
- `DELETE /api/playlists/:id/songs/:songId` - Remove song from playlist (authenticated, owner only)
- `DELETE /api/playlists/:id` - Delete playlist (authenticated, owner only)

### Health Check

- `GET /api/health` - Server health check

## Database Models

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  profilePicture: String,
  likedSongs: [ObjectId],
  preferences: {
    volume: Number,
    shuffle: Boolean,
    repeat: Number
  },
  createdAt: Date
}
```

### Song
```javascript
{
  title: String,
  artist: String,
  album: String,
  duration: Number,
  fileName: String,
  filePath: String,
  coverImage: String,
  genre: String,
  uploadedBy: ObjectId,
  plays: Number,
  createdAt: Date
}
```

### Playlist
```javascript
{
  name: String,
  description: String,
  owner: ObjectId,
  songs: [ObjectId],
  coverImage: String,
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## File Upload

Supported audio formats: MP3, WAV, OGG, M4A, FLAC

Max file size: 50MB

Uploaded files are stored in the `backend/uploads` directory (not committed to git).

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- Protected routes middleware
- Input validation with express-validator
- CORS enabled for frontend integration
- File type validation for uploads

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start
```

## Deployment Considerations

### Environment Variables

Ensure all environment variables are properly set in production:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: MySQL connection details
- `JWT_SECRET`: Use a strong, random secret key
- `PORT`: Set by hosting platform or use 5000

### File Storage

For production, consider using cloud storage (AWS S3, Google Cloud Storage) instead of local file storage.

### CORS

Update CORS configuration in `server.js` to only allow your frontend domain in production.

### Database

Use a managed MySQL service (AWS RDS, Google Cloud SQL, Azure Database for MySQL) for production with proper:
- SSL/TLS connections
- Access controls and firewall rules
- Regular backups
- Connection pooling

## Frontend Integration

The frontend connects to this backend via the `api.js` file which provides methods for all API endpoints.

Key features:
- Automatic token management
- Request/response handling
- Error handling
- Audio streaming integration

## API Response Format

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "songs": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalSongs": 100
}
```

## Testing

Test the API health:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Troubleshooting

### MySQL Connection Issues
- Ensure MySQL server is running
- Check database credentials in `.env`
- Verify database `spotify_clone` exists: `CREATE DATABASE spotify_clone;`
- Check MySQL user permissions
- For remote MySQL, ensure firewall allows connections

### File Upload Issues
- Check upload directory permissions
- Verify file size limits
- Ensure correct audio file formats

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration (default: 7 days)
- Clear browser localStorage if needed

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.
