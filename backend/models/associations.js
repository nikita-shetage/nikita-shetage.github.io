const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Junction table for User's liked songs (many-to-many)
const UserLikedSong = sequelize.define('UserLikedSong', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    songId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'songs',
            key: 'id'
        }
    }
}, {
    tableName: 'user_liked_songs',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'songId']
        }
    ]
});

// Junction table for Playlist songs (many-to-many)
const PlaylistSong = sequelize.define('PlaylistSong', {
    playlistId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'playlists',
            key: 'id'
        }
    },
    songId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'songs',
            key: 'id'
        }
    },
    position: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'playlist_songs',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['playlistId', 'songId']
        }
    ]
});

module.exports = { UserLikedSong, PlaylistSong };
