const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Song } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Register new user
router.post('/register', [
    body('username').isLength({ min: 3 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email or username' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Generate token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        const token = jwt.sign(
            { userId: user.id },
            jwtSecret,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login user
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        const token = jwt.sign(
            { userId: user.id },
            jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                preferences: {
                    volume: user.volume,
                    shuffle: user.shuffle,
                    repeat: user.repeat
                }
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Song,
                as: 'likedSongs',
                through: { attributes: [] }
            }]
        });
        
        // Format response to match frontend expectations
        const userResponse = {
            ...user.toJSON(),
            preferences: {
                volume: user.volume,
                shuffle: user.shuffle,
                repeat: user.repeat
            }
        };
        
        res.json(userResponse);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'profilePicture'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        updates.forEach(update => {
            req.user[update] = req.body[update];
        });
        await req.user.save();
        
        const userResponse = req.user.toJSON();
        delete userResponse.password;
        res.json(userResponse);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(400).json({ error: 'Error updating profile' });
    }
});

// Update user preferences
router.patch('/preferences', auth, async (req, res) => {
    try {
        const { volume, shuffle, repeat } = req.body;
        
        if (volume !== undefined) req.user.volume = volume;
        if (shuffle !== undefined) req.user.shuffle = shuffle;
        if (repeat !== undefined) req.user.repeat = repeat;

        await req.user.save();
        
        res.json({
            volume: req.user.volume,
            shuffle: req.user.shuffle,
            repeat: req.user.repeat
        });
    } catch (error) {
        console.error('Preferences update error:', error);
        res.status(400).json({ error: 'Error updating preferences' });
    }
});

module.exports = router;

    }
});

module.exports = router;
