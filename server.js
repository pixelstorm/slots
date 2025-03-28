// Pirate's Treasure Slot Machine - Node.js Server
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Path to the high scores file
const HIGH_SCORES_FILE = path.join(__dirname, 'high-scores.json');

// Initialize high scores file if it doesn't exist
function initializeHighScores() {
    if (!fs.existsSync(HIGH_SCORES_FILE)) {
        fs.writeFileSync(HIGH_SCORES_FILE, JSON.stringify([]));
        console.log('High scores file created');
    }
}

// Get high scores from file
function getHighScores() {
    try {
        const data = fs.readFileSync(HIGH_SCORES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading high scores:', error);
        return [];
    }
}

// Save high scores to file
function saveHighScores(highScores) {
    try {
        fs.writeFileSync(HIGH_SCORES_FILE, JSON.stringify(highScores, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving high scores:', error);
        return false;
    }
}

// API endpoint to get high scores
app.get('/api/high-scores', (req, res) => {
    const highScores = getHighScores();
    res.json(highScores);
});

// API endpoint to add or update a player's high score
app.post('/api/high-scores', (req, res) => {
    const { name, score, timestamp } = req.body;
    
    if (!name || score === undefined) {
        return res.status(400).json({ error: 'Name and score are required' });
    }
    
    const highScores = getHighScores();
    
    // Check if player already exists
    const existingPlayerIndex = highScores.findIndex(player => player.name === name);
    
    if (existingPlayerIndex !== -1) {
        // Always update the player's score to reflect current gold
        highScores[existingPlayerIndex].score = score;
        highScores[existingPlayerIndex].timestamp = timestamp || new Date().toISOString();
    } else {
        // Add new player
        highScores.push({
            name,
            score,
            timestamp: timestamp || new Date().toISOString()
        });
    }
    
    // Sort high scores by score (descending)
    highScores.sort((a, b) => b.score - a.score);
    
    // Save high scores
    if (saveHighScores(highScores)) {
        res.json({ success: true, message: 'High score saved' });
    } else {
        res.status(500).json({ error: 'Failed to save high score' });
    }
});

// API endpoint to get a specific player's high score
app.get('/api/high-scores/:name', (req, res) => {
    const { name } = req.params;
    const highScores = getHighScores();
    
    const player = highScores.find(player => player.name === name);
    
    if (player) {
        res.json(player);
    } else {
        res.status(404).json({ error: 'Player not found' });
    }
});

// API endpoint to update multiple players' scores at once (for skull curse feature)
app.post('/api/high-scores/batch-update', (req, res) => {
    const { updates } = req.body;
    
    console.log('Received batch update request:', JSON.stringify(req.body));
    
    if (!updates || !Array.isArray(updates)) {
        console.log('Invalid updates array:', updates);
        return res.status(400).json({ error: 'Updates array is required' });
    }
    
    const highScores = getHighScores();
    console.log('Current high scores before update:', JSON.stringify(highScores));
    
    let updatedCount = 0;
    
    // Process each update
    updates.forEach(update => {
        const { name, score, timestamp } = update;
        console.log('Processing update for player:', name, 'score:', score);
        
        if (!name || score === undefined) {
            console.log('Skipping invalid update:', update);
            return; // Skip invalid updates
        }
        
        // Find and update player
        const existingPlayerIndex = highScores.findIndex(player => player.name === name);
        
        if (existingPlayerIndex !== -1) {
            console.log('Updating existing player:', name, 'from', highScores[existingPlayerIndex].score, 'to', score);
            highScores[existingPlayerIndex].score = score;
            highScores[existingPlayerIndex].timestamp = timestamp || new Date().toISOString();
            updatedCount++;
        } else {
            console.log('Adding new player:', name, 'with score:', score);
            // Add new player if not found
            highScores.push({
                name,
                score,
                timestamp: timestamp || new Date().toISOString()
            });
            updatedCount++;
        }
    });
    
    console.log('Updated high scores:', JSON.stringify(highScores));
    
    // Sort high scores by score (descending)
    highScores.sort((a, b) => b.score - a.score);
    
    // Save high scores
    if (saveHighScores(highScores)) {
        res.json({
            success: true,
            message: `${updatedCount} player scores updated successfully`
        });
    } else {
        res.status(500).json({ error: 'Failed to save high scores' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the leaderboard page
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// Initialize high scores file
initializeHighScores();

// Start the server
app.listen(PORT, () => {
    console.log(`Pirate's Treasure server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to play the game`);
});