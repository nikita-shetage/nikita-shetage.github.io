const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');

// Create a new playlist
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Playlist name is required' });
        }

        const playlist = new Playlist({
            name,
            description: description || '',
            owner: req.user._id,
            isPublic: isPublic !== undefined ? isPublic : true
        });

        await playlist.save();
        res.status(201).json(playlist);
    } catch (error) {
        res.status(500).json({ error: 'Error creating playlist' });
    }
});

// Get user's playlists
router.get('/my', auth, async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user._id })
            .populate('songs')
            .sort({ updatedAt: -1 });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching playlists' });
    }
});

// Get all public playlists
router.get('/public', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const playlists = await Playlist.find({ isPublic: true })
            .populate('owner', 'username')
            .populate('songs')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Playlist.countDocuments({ isPublic: true });

        res.json({
            playlists,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPlaylists: total
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching public playlists' });
    }
});

// Get a single playlist
router.get('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate('owner', 'username')
            .populate('songs');

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching playlist' });
    }
});

// Update playlist
router.patch('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'isPublic', 'coverImage'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this playlist' });
        }

        updates.forEach(update => playlist[update] = req.body[update]);
        await playlist.save();

        res.json(playlist);
    } catch (error) {
        res.status(400).json({ error: 'Error updating playlist' });
    }
});

// Add song to playlist
router.post('/:id/songs', auth, async (req, res) => {
    try {
        const { songId } = req.body;

        if (!songId) {
            return res.status(400).json({ error: 'Song ID is required' });
        }

        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to modify this playlist' });
        }

        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ error: 'Song already in playlist' });
        }

        playlist.songs.push(songId);
        await playlist.save();

        await playlist.populate('songs');
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: 'Error adding song to playlist' });
    }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to modify this playlist' });
        }

        const songIndex = playlist.songs.indexOf(req.params.songId);
        if (songIndex === -1) {
            return res.status(404).json({ error: 'Song not in playlist' });
        }

        playlist.songs.splice(songIndex, 1);
        await playlist.save();

        await playlist.populate('songs');
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: 'Error removing song from playlist' });
    }
});

// Delete playlist
router.delete('/:id', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this playlist' });
        }

        await Playlist.findByIdAndDelete(req.params.id);
        res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting playlist' });
    }
});

module.exports = router;
