// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

class SpotifyAPI {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    // Helper method to make authenticated requests
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    }

    // Auth methods
    async register(username, email, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        this.setToken(data.token);
        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setToken(data.token);
        return data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async updateProfile(updates) {
        return this.request('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    async updatePreferences(preferences) {
        return this.request('/auth/preferences', {
            method: 'PATCH',
            body: JSON.stringify(preferences)
        });
    }

    // Song methods
    async uploadSong(formData) {
        const response = await fetch(`${API_BASE_URL}/songs/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return response.json();
    }

    async getSongs(page = 1, limit = 20) {
        return this.request(`/songs?page=${page}&limit=${limit}`);
    }

    async getSong(id) {
        return this.request(`/songs/${id}`);
    }

    getSongStreamUrl(id) {
        return `${API_BASE_URL}/songs/${id}/stream`;
    }

    async deleteSong(id) {
        return this.request(`/songs/${id}`, { method: 'DELETE' });
    }

    async likeSong(id) {
        return this.request(`/songs/${id}/like`, { method: 'POST' });
    }

    async getLikedSongs() {
        return this.request('/songs/liked/all');
    }

    // Playlist methods
    async createPlaylist(name, description, isPublic = true) {
        return this.request('/playlists', {
            method: 'POST',
            body: JSON.stringify({ name, description, isPublic })
        });
    }

    async getMyPlaylists() {
        return this.request('/playlists/my');
    }

    async getPublicPlaylists(page = 1, limit = 20) {
        return this.request(`/playlists/public?page=${page}&limit=${limit}`);
    }

    async getPlaylist(id) {
        return this.request(`/playlists/${id}`);
    }

    async updatePlaylist(id, updates) {
        return this.request(`/playlists/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    async addSongToPlaylist(playlistId, songId) {
        return this.request(`/playlists/${playlistId}/songs`, {
            method: 'POST',
            body: JSON.stringify({ songId })
        });
    }

    async removeSongFromPlaylist(playlistId, songId) {
        return this.request(`/playlists/${playlistId}/songs/${songId}`, {
            method: 'DELETE'
        });
    }

    async deletePlaylist(id) {
        return this.request(`/playlists/${id}`, { method: 'DELETE' });
    }

    isAuthenticated() {
        return !!this.token;
    }
}

// Export singleton instance
const api = new SpotifyAPI();
