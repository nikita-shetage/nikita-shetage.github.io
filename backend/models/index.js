const sequelize = require('../config/database');
const User = require('./User');
const Song = require('./Song');
const Playlist = require('./Playlist');
const { UserLikedSong, PlaylistSong } = require('./associations');

// Define relationships

// User has many Songs (uploaded)
User.hasMany(Song, {
    foreignKey: 'uploadedBy',
    as: 'uploadedSongs'
});
Song.belongsTo(User, {
    foreignKey: 'uploadedBy',
    as: 'uploader'
});

// User has many Playlists (owned)
User.hasMany(Playlist, {
    foreignKey: 'owner',
    as: 'playlists'
});
Playlist.belongsTo(User, {
    foreignKey: 'owner',
    as: 'user'
});

// User and Song many-to-many (liked songs)
User.belongsToMany(Song, {
    through: UserLikedSong,
    foreignKey: 'userId',
    otherKey: 'songId',
    as: 'likedSongs'
});
Song.belongsToMany(User, {
    through: UserLikedSong,
    foreignKey: 'songId',
    otherKey: 'userId',
    as: 'likedByUsers'
});

// Playlist and Song many-to-many (playlist songs)
Playlist.belongsToMany(Song, {
    through: PlaylistSong,
    foreignKey: 'playlistId',
    otherKey: 'songId',
    as: 'songs'
});
Song.belongsToMany(Playlist, {
    through: PlaylistSong,
    foreignKey: 'songId',
    otherKey: 'playlistId',
    as: 'playlists'
});

module.exports = {
    sequelize,
    User,
    Song,
    Playlist,
    UserLikedSong,
    PlaylistSong
};
