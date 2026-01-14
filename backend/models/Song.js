const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Song = sequelize.define('Song', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    artist: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    album: {
        type: DataTypes.STRING(200),
        defaultValue: 'Unknown Album'
    },
    duration: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    fileName: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
    coverImage: {
        type: DataTypes.STRING(500),
        defaultValue: ''
    },
    genre: {
        type: DataTypes.STRING(100),
        defaultValue: 'Unknown'
    },
    uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    plays: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'songs',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

module.exports = Song;

