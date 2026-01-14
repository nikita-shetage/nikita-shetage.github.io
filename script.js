// Constants
const PROGRESS_UPDATE_INTERVAL = 0.1; // seconds

// Sample track data
const tracks = [
    {
        title: "Daily Mix 1",
        artist: "Various Artists",
        duration: 225,
        icon: "music"
    },
    {
        title: "Discover Weekly",
        artist: "Spotify",
        duration: 198,
        icon: "headphones"
    },
    {
        title: "Release Radar",
        artist: "New Music",
        duration: 242,
        icon: "compact-disc"
    },
    {
        title: "Jazz Vibes",
        artist: "Jazz Collective",
        duration: 267,
        icon: "drum"
    },
    {
        title: "Rock Anthems",
        artist: "Rock Legends",
        duration: 301,
        icon: "guitar"
    },
    {
        title: "Midnight Melodies",
        artist: "Night Owl",
        duration: 189,
        icon: "moon"
    },
    {
        title: "Morning Motivation",
        artist: "Energy Boost",
        duration: 215,
        icon: "sun"
    },
    {
        title: "Workout Power",
        artist: "Fitness Mix",
        duration: 234,
        icon: "dumbbell"
    }
];

// Player state
let currentTrackIndex = 0;
let isPlaying = false;
let currentTime = 0;
let duration = tracks[0].duration;
let volume = 0.7;
let isShuffle = false;
let repeatMode = 0; // 0: off, 1: repeat all, 2: repeat one
let animationId = null;

// DOM Elements
const playPauseBtn = document.querySelector('.play-pause-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const shuffleBtn = document.querySelector('.shuffle-btn');
const repeatBtn = document.querySelector('.repeat-btn');
const progressBar = document.querySelector('.progress-bar');
const progressBarFill = document.querySelector('.progress-bar-fill');
const progressBarThumb = document.querySelector('.progress-bar-thumb');
const currentTimeEl = document.querySelector('.current-time');
const totalTimeEl = document.querySelector('.total-time');
const trackNameEl = document.querySelector('.track-name');
const artistNameEl = document.querySelector('.artist-name');
const nowPlayingImg = document.querySelector('.now-playing-img');
const likeBtn = document.querySelector('.like-btn');
const volumeBtn = document.querySelector('.volume-btn');
const volumeBar = document.querySelector('.volume-bar');
const volumeBarFill = document.querySelector('.volume-bar-fill');
const volumeBarThumb = document.querySelector('.volume-bar-thumb');
const cardPlayBtns = document.querySelectorAll('.card .play-btn');

// Initialize player
function init() {
    loadTrack(currentTrackIndex);
    updateVolume(volume);
    
    // Add event listeners
    playPauseBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    likeBtn.addEventListener('click', toggleLike);
    
    progressBar.addEventListener('click', seekProgress);
    volumeBar.addEventListener('click', seekVolume);
    volumeBtn.addEventListener('click', toggleMute);
    
    // Card play buttons
    cardPlayBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackIndex = parseInt(btn.closest('.card').dataset.track);
            if (currentTrackIndex === trackIndex && isPlaying) {
                pause();
            } else {
                loadTrack(trackIndex);
                play();
            }
        });
    });
}

// Load track
function loadTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    
    trackNameEl.textContent = track.title;
    artistNameEl.textContent = track.artist;
    duration = track.duration;
    currentTime = 0;
    
    // Update icon
    nowPlayingImg.innerHTML = `<i class="fas fa-${track.icon}"></i>`;
    
    updateTimeDisplay();
}

// Play/Pause
function togglePlay() {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

function play() {
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    startProgressAnimation();
    updateCardPlayButtons();
}

function pause() {
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    stopProgressAnimation();
    updateCardPlayButtons();
}

// Previous/Next
function playPrevious() {
    if (currentTime > 3) {
        currentTime = 0;
        updateProgress();
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) play();
    }
}

function playNext() {
    if (isShuffle) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * tracks.length);
        } while (randomIndex === currentTrackIndex && tracks.length > 1);
        currentTrackIndex = randomIndex;
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    }
    loadTrack(currentTrackIndex);
    if (isPlaying) play();
}

// Shuffle
function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
}

// Repeat
function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    repeatBtn.classList.toggle('active', repeatMode > 0);
    
    if (repeatMode === 0) {
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
    } else if (repeatMode === 1) {
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
    } else {
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i> <span style="font-size: 10px;">1</span>';
    }
}

// Like
function toggleLike() {
    const icon = likeBtn.querySelector('i');
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        likeBtn.classList.add('liked');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        likeBtn.classList.remove('liked');
    }
}

// Progress animation
function startProgressAnimation() {
    function animate() {
        if (isPlaying) {
            currentTime += PROGRESS_UPDATE_INTERVAL;
            if (currentTime >= duration) {
                handleTrackEnd();
            } else {
                updateProgress();
                animationId = requestAnimationFrame(animate);
            }
        }
    }
    animationId = requestAnimationFrame(animate);
}

function stopProgressAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function handleTrackEnd() {
    if (repeatMode === 2) {
        currentTime = 0;
        updateProgress();
    } else if (repeatMode === 1 || currentTrackIndex < tracks.length - 1) {
        playNext();
    } else {
        pause();
        currentTime = 0;
        updateProgress();
    }
}

// Update progress
function updateProgress() {
    const percentage = (currentTime / duration) * 100;
    progressBarFill.style.width = `${percentage}%`;
    progressBarThumb.style.right = `${100 - percentage}%`;
    updateTimeDisplay();
}

function updateTimeDisplay() {
    currentTimeEl.textContent = formatTime(currentTime);
    totalTimeEl.textContent = formatTime(duration);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Seek progress
function seekProgress(e) {
    const rect = progressBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    currentTime = percentage * duration;
    updateProgress();
}

// Volume control
function updateVolume(vol) {
    volume = Math.max(0, Math.min(1, vol));
    volumeBarFill.style.width = `${volume * 100}%`;
    volumeBarThumb.style.right = `${(1 - volume) * 100}%`;
    
    if (volume === 0) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 0.5) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function seekVolume(e) {
    const rect = volumeBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    updateVolume(percentage);
}

let previousVolume = volume;
function toggleMute() {
    if (volume > 0) {
        previousVolume = volume;
        updateVolume(0);
    } else {
        updateVolume(previousVolume);
    }
}

// Add drag functionality for progress bar
let isDraggingProgress = false;

function onProgressMouseMove(e) {
    if (isDraggingProgress) {
        seekProgress(e);
    }
}

function onProgressMouseUp() {
    if (isDraggingProgress) {
        isDraggingProgress = false;
        document.removeEventListener('mousemove', onProgressMouseMove);
        document.removeEventListener('mouseup', onProgressMouseUp);
    }
}

progressBar.addEventListener('mousedown', (e) => {
    isDraggingProgress = true;
    seekProgress(e);
    document.addEventListener('mousemove', onProgressMouseMove);
    document.addEventListener('mouseup', onProgressMouseUp);
});

// Add drag functionality for volume bar
let isDraggingVolume = false;

function onVolumeMouseMove(e) {
    if (isDraggingVolume) {
        seekVolume(e);
    }
}

function onVolumeMouseUp() {
    if (isDraggingVolume) {
        isDraggingVolume = false;
        document.removeEventListener('mousemove', onVolumeMouseMove);
        document.removeEventListener('mouseup', onVolumeMouseUp);
    }
}

volumeBar.addEventListener('mousedown', (e) => {
    isDraggingVolume = true;
    seekVolume(e);
    document.addEventListener('mousemove', onVolumeMouseMove);
    document.addEventListener('mouseup', onVolumeMouseUp);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        currentTime = Math.min(currentTime + 5, duration);
        updateProgress();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        currentTime = Math.max(currentTime - 5, 0);
        updateProgress();
    } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        updateVolume(volume + 0.1);
    } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        updateVolume(volume - 0.1);
    }
});

// Update card play button states
function updateCardPlayButtons() {
    cardPlayBtns.forEach((btn, index) => {
        const trackIndex = parseInt(btn.closest('.card').dataset.track);
        const icon = btn.querySelector('i');
        if (trackIndex === currentTrackIndex && isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    });
}

// ========================================
// BACKEND INTEGRATION
// ========================================

// Additional DOM Elements for backend features
const authModal = document.getElementById('auth-modal');
const uploadModal = document.getElementById('upload-modal');
const playlistModal = document.getElementById('playlist-modal');
const userProfile = document.getElementById('user-profile');
const usernameDisplay = document.getElementById('username-display');
const logoutBtn = document.getElementById('logout-btn');
const uploadBtn = document.getElementById('upload-btn');
const createPlaylistBtn = document.getElementById('create-playlist-btn');
const likedSongsBtn = document.getElementById('liked-songs-btn');

// Close modal buttons
const closeModalBtns = document.querySelectorAll('.close-modal');
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        authModal.style.display = 'none';
        uploadModal.style.display = 'none';
        playlistModal.style.display = 'none';
    });
});

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target === authModal) authModal.style.display = 'none';
    if (e.target === uploadModal) uploadModal.style.display = 'none';
    if (e.target === playlistModal) playlistModal.style.display = 'none';
});

// Auth form toggles
document.getElementById('show-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

// User authentication state
let currentUser = null;
let backendTracks = [];

// Check authentication on load
function checkAuth() {
    if (api.isAuthenticated()) {
        loadUserProfile();
    } else {
        showLoginUI();
    }
}

async function loadUserProfile() {
    try {
        const profile = await api.getProfile();
        currentUser = profile;
        usernameDisplay.textContent = profile.username;
        logoutBtn.style.display = 'block';
        uploadBtn.style.display = 'flex';
        
        // Load user preferences
        if (profile.preferences) {
            volume = profile.preferences.volume || 0.7;
            isShuffle = profile.preferences.shuffle || false;
            repeatMode = profile.preferences.repeat || 0;
            updateVolume(volume);
            if (isShuffle) shuffleBtn.classList.add('active');
            if (repeatMode > 0) repeatBtn.classList.add('active');
        }
        
        // Load songs from backend
        await loadBackendSongs();
    } catch (error) {
        console.error('Error loading profile:', error);
        showLoginUI();
    }
}

function showLoginUI() {
    usernameDisplay.textContent = 'Login';
    logoutBtn.style.display = 'none';
    uploadBtn.style.display = 'none';
}

// Show auth modal when clicking on user profile
userProfile.addEventListener('click', () => {
    if (!api.isAuthenticated()) {
        authModal.style.display = 'block';
    }
});

// Login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await api.login(email, password);
        authModal.style.display = 'none';
        await loadUserProfile();
        showMessage('Logged in successfully!', 'success');
    } catch (error) {
        showMessage(error.message || 'Login failed', 'error');
    }
});

// Signup form submission
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        await api.register(username, email, password);
        authModal.style.display = 'none';
        await loadUserProfile();
        showMessage('Account created successfully!', 'success');
    } catch (error) {
        showMessage(error.message || 'Registration failed', 'error');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    api.logout();
    currentUser = null;
    backendTracks = [];
    showLoginUI();
    // Reload with sample tracks
    location.reload();
});

// Upload song
uploadBtn.addEventListener('click', () => {
    if (api.isAuthenticated()) {
        uploadModal.style.display = 'block';
    }
});

document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const audioFile = document.getElementById('audio-file').files[0];
    const title = document.getElementById('song-title').value;
    const artist = document.getElementById('song-artist').value;
    const album = document.getElementById('song-album').value;
    const genre = document.getElementById('song-genre').value;
    
    if (!audioFile) {
        showMessage('Please select an audio file', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('title', title);
    formData.append('artist', artist);
    if (album) formData.append('album', album);
    if (genre) formData.append('genre', genre);
    
    const progressDiv = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    progressDiv.style.display = 'block';
    
    try {
        const song = await api.uploadSong(formData);
        progressBar.value = 100;
        progressText.textContent = '100%';
        
        showMessage('Song uploaded successfully!', 'success');
        uploadModal.style.display = 'none';
        document.getElementById('uploadForm').reset();
        progressDiv.style.display = 'none';
        
        // Reload songs
        await loadBackendSongs();
    } catch (error) {
        showMessage(error.message || 'Upload failed', 'error');
        progressDiv.style.display = 'none';
    }
});

// Create playlist
createPlaylistBtn.addEventListener('click', () => {
    if (api.isAuthenticated()) {
        playlistModal.style.display = 'block';
    } else {
        authModal.style.display = 'block';
    }
});

document.getElementById('createPlaylistForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('playlist-name').value;
    const description = document.getElementById('playlist-description').value;
    const isPublic = document.getElementById('playlist-public').checked;
    
    try {
        await api.createPlaylist(name, description, isPublic);
        showMessage('Playlist created successfully!', 'success');
        playlistModal.style.display = 'none';
        document.getElementById('createPlaylistForm').reset();
        await loadUserPlaylists();
    } catch (error) {
        showMessage(error.message || 'Failed to create playlist', 'error');
    }
});

// Load songs from backend
async function loadBackendSongs() {
    try {
        const response = await api.getSongs(1, 50);
        backendTracks = response.songs.map(song => ({
            id: song._id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            streamUrl: api.getSongStreamUrl(song._id),
            icon: song.genre?.toLowerCase() || 'music'
        }));
        
        // Replace sample tracks with backend tracks if available
        if (backendTracks.length > 0) {
            tracks.length = 0;
            tracks.push(...backendTracks);
            
            // Reload current track
            if (currentTrackIndex >= tracks.length) {
                currentTrackIndex = 0;
            }
            loadTrack(currentTrackIndex);
        }
    } catch (error) {
        console.error('Error loading songs:', error);
    }
}

// Load user playlists
async function loadUserPlaylists() {
    if (!api.isAuthenticated()) return;
    
    try {
        const playlists = await api.getMyPlaylists();
        const playlistList = document.getElementById('playlist-list');
        
        // Keep some default playlists and add user playlists
        playlistList.innerHTML = playlists.map(p => 
            `<li data-playlist-id="${p._id}">${p.name}</li>`
        ).join('');
    } catch (error) {
        console.error('Error loading playlists:', error);
    }
}

// Like/Unlike current song
const originalToggleLike = likeBtn.onclick;
likeBtn.onclick = async function() {
    if (!api.isAuthenticated()) {
        authModal.style.display = 'block';
        return;
    }
    
    const currentTrack = tracks[currentTrackIndex];
    if (currentTrack && currentTrack.id) {
        try {
            const result = await api.likeSong(currentTrack.id);
            const icon = likeBtn.querySelector('i');
            if (result.liked) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                likeBtn.classList.add('liked');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                likeBtn.classList.remove('liked');
            }
        } catch (error) {
            console.error('Error liking song:', error);
        }
    } else if (originalToggleLike) {
        originalToggleLike.call(this);
    }
};

// Save user preferences when they change
async function savePreferences() {
    if (!api.isAuthenticated()) return;
    
    try {
        await api.updatePreferences({
            volume: volume,
            shuffle: isShuffle,
            repeat: repeatMode
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
}

// Override toggle functions to save preferences
const originalToggleShuffle = toggleShuffle;
function toggleShuffle() {
    originalToggleShuffle();
    savePreferences();
}

const originalToggleRepeat = toggleRepeat;
function toggleRepeat() {
    originalToggleRepeat();
    savePreferences();
}

// Save volume after user adjusts it
let volumeSaveTimeout;
const originalUpdateVolume = updateVolume;
function updateVolume(vol) {
    originalUpdateVolume(vol);
    
    // Debounce saving to avoid too many API calls
    clearTimeout(volumeSaveTimeout);
    volumeSaveTimeout = setTimeout(() => {
        savePreferences();
    }, 1000);
}

// Update audio element to use streaming URL
const audioPlayer = document.getElementById('audio-player');
function loadTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    
    trackNameEl.textContent = track.title;
    artistNameEl.textContent = track.artist;
    duration = track.duration;
    currentTime = 0;
    
    // Update icon
    nowPlayingImg.innerHTML = `<i class="fas fa-${track.icon}"></i>`;
    
    // Set audio source if streaming URL is available
    if (track.streamUrl) {
        audioPlayer.src = track.streamUrl;
        audioPlayer.load();
    }
    
    updateTimeDisplay();
}

// Override play/pause to use real audio element when available
function play() {
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    const track = tracks[currentTrackIndex];
    if (track.streamUrl && audioPlayer.src) {
        audioPlayer.play();
        syncWithAudioElement();
    } else {
        startProgressAnimation();
    }
    
    updateCardPlayButtons();
}

function pause() {
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    
    if (audioPlayer.src) {
        audioPlayer.pause();
    }
    
    stopProgressAnimation();
    updateCardPlayButtons();
}

// Sync progress with actual audio playback
function syncWithAudioElement() {
    if (!audioPlayer.src) return;
    
    audioPlayer.addEventListener('timeupdate', () => {
        if (isPlaying) {
            currentTime = audioPlayer.currentTime;
            duration = audioPlayer.duration || duration;
            updateProgress();
        }
    });
    
    audioPlayer.addEventListener('ended', handleTrackEnd);
    audioPlayer.volume = volume;
}

// Show message helper
function showMessage(message, type) {
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? 'var(--spotify-green)' : '#e22134'};
        color: white;
        padding: 16px 24px;
        border-radius: 4px;
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    checkAuth();
});
