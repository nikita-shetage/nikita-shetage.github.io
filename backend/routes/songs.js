const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseFile } = require('music-metadata');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a|flac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only audio files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: fileFilter
});

// Upload a new song
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const filePath = req.file.path;
        
        // Extract metadata from audio file
        let metadata;
        try {
            metadata = await parseFile(filePath);
        } catch (error) {
            // If metadata extraction fails, use defaults
            metadata = { format: {}, common: {} };
        }

        const song = new Song({
            title: req.body.title || metadata.common.title || path.parse(req.file.originalname).name,
            artist: req.body.artist || metadata.common.artist || 'Unknown Artist',
            album: req.body.album || metadata.common.album || 'Unknown Album',
            duration: metadata.format.duration || 0,
            fileName: req.file.filename,
            filePath: filePath,
            genre: req.body.genre || metadata.common.genre?.[0] || 'Unknown',
            uploadedBy: req.user._id
        });

        await song.save();

        res.status(201).json(song);
    } catch (error) {
        // Clean up file if song creation fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).json({ error: 'Error uploading song' });
    }
});

// Get all songs
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const songs = await Song.find()
            .populate('uploadedBy', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Song.countDocuments();

        res.json({
            songs,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalSongs: total
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching songs' });
    }
});

// Get a single song
router.get('/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id).populate('uploadedBy', 'username');
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.json(song);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching song' });
    }
});

// Stream a song
router.get('/:id/stream', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }

        const filePath = song.filePath;
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Audio file not found' });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg',
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }

        // Increment play count
        song.plays += 1;
        await song.save();
    } catch (error) {
        res.status(500).json({ error: 'Error streaming song' });
    }
});

// Delete a song
router.delete('/:id', auth, async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }

        // Check if user owns the song
        if (song.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this song' });
        }

        // Delete file asynchronously
        if (fs.existsSync(song.filePath)) {
            fs.unlink(song.filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        await Song.findByIdAndDelete(req.params.id);
        res.json({ message: 'Song deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting song' });
    }
});

// Like/unlike a song
router.post('/:id/like', auth, async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }

        const user = req.user;
        const songIndex = user.likedSongs.indexOf(song._id);

        if (songIndex > -1) {
            // Unlike
            user.likedSongs.splice(songIndex, 1);
        } else {
            // Like
            user.likedSongs.push(song._id);
        }

        await user.save();
        res.json({ liked: songIndex === -1, likedSongs: user.likedSongs });
    } catch (error) {
        res.status(500).json({ error: 'Error updating liked songs' });
    }
});

// Get user's liked songs
router.get('/liked/all', auth, async (req, res) => {
    try {
        const user = await req.user.populate('likedSongs');
        res.json(user.likedSongs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching liked songs' });
    }
});

module.exports = router;
