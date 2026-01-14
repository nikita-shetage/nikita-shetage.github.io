const express = require('express');
const router = express.Router();
const { Playlist, Song, User, PlaylistSong } = require('../models');
const auth = require('../middleware/auth');

// Create a new playlist
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Playlist name is required' });
        }

        const playlist = await Playlist.create({
            name,
            description: description || '',
            owner: req.user.id,
            isPublic: isPublic !== undefined ? isPublic : true
        });

        res.status(201).json(playlist);
    } catch (error) {
        console.error('Create playlist error:', error);
        res.status(500).json({ error: 'Error creating playlist' });
    }
});

// Get user's playlists
router.get('/my', auth, async (req, res) => {
    try {
        const playlists = await Playlist.findAll({
            where: { owner: req.user.id },
            include: [{
                model: Song,
                as: 'songs',
                through: { attributes: [] }
            }],
            order: [['updatedAt', 'DESC']]
        });
        res.json(playlists);
    } catch (error) {
        console.error('Get my playlists error:', error);
        res.status(500).json({ error: 'Error fetching playlists' });
    }
});

// Get all public playlists
router.get('/public', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows: playlists } = await Playlist.findAndCountAll({
            where: { isPublic: true },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: Song,
                    as: 'songs',
                    through: { attributes: [] }
                }
            ],
            order: [['updatedAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            playlists,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalPlaylists: count
        });
    } catch (error) {
        console.error('Get public playlists error:', error);
        res.status(500).json({ error: 'Error fetching public playlists' });
    }
});

// Get a single playlist
router.get('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: Song,
                    as: 'songs',
                    through: { attributes: [] }
                }
            ]
        });

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        res.json(playlist);
    } catch (error) {
        console.error('Get playlist error:', error);
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
        const playlist = await Playlist.findByPk(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.owner !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this playlist' });
        }

        updates.forEach(update => {
            playlist[update] = req.body[update];
        });
        await playlist.save();

        res.json(playlist);
    } catch (error) {
        console.error('Update playlist error:', error);
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

        const playlist = await Playlist.findByPk(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.owner !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to modify this playlist' });
        }

        // Check if song exists
        const song = await Song.findByPk(songId);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }

        // Check if song already in playlist
        const existingSong = await PlaylistSong.findOne({
            where: {
                playlistId: playlist.id,
                songId: songId
            }
        });

        if (existingSong) {
            return res.status(400).json({ error: 'Song already in playlist' });
        }

        await PlaylistSong.create({
            playlistId: playlist.id,
            songId: songId
        });

        // Fetch updated playlist with songs
        const updatedPlaylist = await Playlist.findByPk(req.params.id, {
            include: [{
                model: Song,
                as: 'songs',
                through: { attributes: [] }
            }]
        });

        res.json(updatedPlaylist);
    } catch (error) {
        console.error('Add song to playlist error:', error);
        res.status(500).json({ error: 'Error adding song to playlist' });
    }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findByPk(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.owner !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to modify this playlist' });
        }

        const playlistSong = await PlaylistSong.findOne({
            where: {
                playlistId: req.params.id,
                songId: req.params.songId
            }
        });

        if (!playlistSong) {
            return res.status(404).json({ error: 'Song not in playlist' });
        }

        await playlistSong.destroy();

        // Fetch updated playlist with songs
        const updatedPlaylist = await Playlist.findByPk(req.params.id, {
            include: [{
                model: Song,
                as: 'songs',
                through: { attributes: [] }
            }]
        });

        res.json(updatedPlaylist);
    } catch (error) {
        console.error('Remove song from playlist error:', error);
        res.status(500).json({ error: 'Error removing song from playlist' });
    }
});

// Delete playlist
router.delete('/:id', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findByPk(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.owner !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this playlist' });
        }

        await playlist.destroy();
        res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error('Delete playlist error:', error);
        res.status(500).json({ error: 'Error deleting playlist' });
    }
});

module.exports = router;


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
