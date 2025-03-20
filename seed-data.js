// Seed data script for Pirate's Treasure Slot Machine
// This script adds sample players with high scores to the high-scores.json file

const fs = require('fs');
const path = require('path');

// Path to the high scores file
const HIGH_SCORES_FILE = path.join(__dirname, 'high-scores.json');

// Sample pirate names
const pirateNames = [
    'Blackbeard',
    'Captain Hook',
    'Long John Silver',
    'Anne Bonny',
    'Calico Jack',
    'Mary Read',
    'Captain Kidd',
    'Bartholomew Roberts',
    'Grace O\'Malley',
    'Henry Morgan'
];

// Generate random high scores
function generateHighScores() {
    const highScores = [];
    
    // Create a high score entry for each pirate
    pirateNames.forEach(name => {
        // Generate a random high score between 100 and 5000
        const score = Math.floor(Math.random() * 4900) + 100;
        
        // Generate a random date within the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        highScores.push({
            name,
            score,
            timestamp: date.toISOString()
        });
    });
    
    // Sort high scores by score (descending)
    highScores.sort((a, b) => b.score - a.score);
    
    return highScores;
}

// Save high scores to file
function saveHighScores(highScores) {
    try {
        fs.writeFileSync(HIGH_SCORES_FILE, JSON.stringify(highScores, null, 2));
        console.log('Sample high scores saved to', HIGH_SCORES_FILE);
        console.log('High scores:');
        highScores.forEach((player, index) => {
            console.log(`${index + 1}. ${player.name}: $${player.score}`);
        });
        return true;
    } catch (error) {
        console.error('Error saving high scores:', error);
        return false;
    }
}

// Generate and save high scores
const highScores = generateHighScores();
saveHighScores(highScores);

console.log('\nYou can now refresh the game to see the sample high scores on the Treasure Board!');