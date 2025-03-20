// Pirate's Treasure - High Score Board

// High scores are saved to the leaderboard automatically after:
// 1. Each win that exceeds the player's previous biggest win
// 2. When a new player is created

// Game configuration (must match the main game)
const config = {
    initialBalance: 1000,
    maxLeaderboardEntries: 10
};

// DOM Elements
const leaderboardBody = document.getElementById('leaderboard-body');
const totalPlayersElement = document.getElementById('total-players');
const biggestWinEverElement = document.getElementById('biggest-win-ever');
const mostRecentWinnerElement = document.getElementById('most-recent-winner');

// Sound effects
const sounds = {
    buttonClick: new Howl({
        src: ['https://assets.codepen.io/21542/Click.mp3'],
        volume: 0.5
    }),
    pirateAmbience: new Howl({
        src: ['https://assets.codepen.io/21542/pirate-ship-ambience.mp3'],
        volume: 0.2,
        loop: true
    })
};

let players = [];

// Initialize the high score board
function init() {
    console.log('Initializing leaderboard...');
    
    // Initialize localStorage with default data if none exists
    initializeLocalStorage();
    
    // Force a refresh of localStorage data
    const rawData = localStorage.getItem('pirateSlots_players');
    console.log('Raw localStorage data on leaderboard init:', rawData);
    
    // Parse the data directly to see what's in localStorage
    if (rawData) {
        try {
            const parsedData = JSON.parse(rawData);
            console.log('Parsed localStorage data:', parsedData);
            
            // Log each player's details
            parsedData.forEach((player, index) => {
                console.log(`Pirate ${index + 1}: ${player.name}, Gold: $${player.balance}, Biggest Haul: $${player.biggestWin}`);
            });
            
            // Use this data directly
            players = parsedData;
        } catch (error) {
            console.error('Error parsing localStorage data:', error);
        }
    }
    
    // Update high score board
    updateHighScoreBoard();
    
    // Update stats
    updateStats();
    
    // Start pirate ambience sound
    sounds.pirateAmbience.play();
}

// Initialize localStorage with empty players array if none exists
function initializeLocalStorage() {
    // Check if players data exists in localStorage
    const playersData = localStorage.getItem('pirateSlots_players');
    
    // If no data exists, initialize with an empty array
    if (!playersData) {
        console.log('Initializing localStorage with empty players array');
        
        // Initialize with empty array - players will be added as they play
        const emptyPlayers = [];
        
        // Save empty players array to localStorage
        localStorage.setItem('pirateSlots_players', JSON.stringify(emptyPlayers));
    }
}

// Load player data from localStorage
function loadPlayerData() {
    try {
        // Load players data
        const playersData = localStorage.getItem('pirateSlots_players');
        console.log('Raw player data from localStorage:', playersData);
        
        if (playersData) {
            players = JSON.parse(playersData);
            console.log('Parsed players data:', players);
            
            // Debug: Log each player's name and biggest win
            players.forEach((player, index) => {
                console.log(`Pirate ${index + 1}: ${player.name}, Biggest Haul: $${player.biggestWin}`);
            });
        } else {
            console.log('No players data found in localStorage');
            // Initialize with empty array
            players = [];
            // Initialize localStorage
            initializeLocalStorage();
        }
    } catch (error) {
        console.error('Error loading player data:', error);
        // Initialize with empty array if there's an error
        players = [];
    }
}

// Update high score board display
async function updateHighScoreBoard() {
    try {
        // First, get high scores from the server API
        const response = await fetch('/api/high-scores');
        let serverHighScores = [];
        
        if (response.ok) {
            serverHighScores = await response.json();
            console.log('Server high scores:', serverHighScores);
        } else {
            console.error('Failed to fetch high scores from server:', response.status);
        }
        
        // Clear current high score board
        leaderboardBody.innerHTML = '';
        
        // Combine server high scores with localStorage high scores
        let allPlayers = [...serverHighScores];
        
        // Add localStorage players if not already in the list
        players.forEach(player => {
            if (!allPlayers.some(p => p.name === player.name)) {
                allPlayers.push({
                    name: player.name,
                    score: player.balance,
                    timestamp: player.lastPlayed
                });
            }
        });
        
        console.log('Updating high score board with players:', allPlayers);
        console.log('Number of pirates:', allPlayers.length);
        
        // Sort players by score (descending)
        let sortedPlayers = [...allPlayers].sort((a, b) => {
            // For server players, use score
            const scoreA = a.score !== undefined ? a.score : a.biggestWin;
            const scoreB = b.score !== undefined ? b.score : b.biggestWin;
            return scoreB - scoreA;
        });
        console.log('Sorted pirates:', sortedPlayers);
        
        // Limit to max entries
        const topPlayers = sortedPlayers.slice(0, config.maxLeaderboardEntries);
        console.log('Top pirates to display:', topPlayers);
        
        // Get current player name from localStorage
        const currentPlayerName = localStorage.getItem('pirateSlots_currentPlayer');
        console.log('Current pirate name:', currentPlayerName);
        
        // Add players to high score board
        topPlayers.forEach((player, index) => {
            const row = document.createElement('tr');
            
            // Add rank class for top 3
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            
            // Highlight current player
            const isCurrentPlayer = currentPlayerName && player.name === currentPlayerName;
            if (isCurrentPlayer) {
                row.classList.add('current-player');
            }
            
            // Format the last played date
            const timestamp = player.timestamp || player.lastPlayed || new Date().toISOString();
            const lastPlayed = new Date(timestamp);
            const formattedDate = lastPlayed.toLocaleDateString();
            
            // Get the score (handle both server and localStorage formats)
            const score = player.score !== undefined ? player.score : player.biggestWin;
            
            row.innerHTML = `
                <td class="${rankClass}">${index + 1}</td>
                <td>${player.name}${isCurrentPlayer ? ' <i class="fas fa-user"></i>' : ''}</td>
                <td>$${score}</td>
                <td>${formattedDate}</td>
            `;
            
            leaderboardBody.appendChild(row);
        });
        
        // If no players with wins, show a message
        if (topPlayers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="4" class="no-players">No treasures found yet. Be the first to plunder the riches!</td>
            `;
            leaderboardBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error updating high score board:', error);
        
        // Fallback to localStorage only if there's an error
        if (players.length > 0) {
            // Clear current high score board
            leaderboardBody.innerHTML = '';
            
            // Sort players by balance (descending)
            let sortedPlayers = [...players].sort((a, b) => b.balance - a.balance);
            
            // Limit to max entries
            const topPlayers = sortedPlayers.slice(0, config.maxLeaderboardEntries);
            
            // Get current player name from localStorage
            const currentPlayerName = localStorage.getItem('pirateSlots_currentPlayer');
            
            // Add players to high score board
            topPlayers.forEach((player, index) => {
                const row = document.createElement('tr');
                const rankClass = index < 3 ? `rank-${index + 1}` : '';
                const isCurrentPlayer = currentPlayerName && player.name === currentPlayerName;
                if (isCurrentPlayer) {
                    row.classList.add('current-player');
                }
                
                const lastPlayed = new Date(player.lastPlayed);
                const formattedDate = lastPlayed.toLocaleDateString();
                
                row.innerHTML = `
                    <td class="${rankClass}">${index + 1}</td>
                    <td>${player.name}${isCurrentPlayer ? ' <i class="fas fa-user"></i>' : ''}</td>
                    <td>$${player.balance}</td>
                    <td>${formattedDate}</td>
                `;
                
                leaderboardBody.appendChild(row);
            });
            
            // If no players with wins, show a message
            if (topPlayers.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="4" class="no-players">No treasures found yet. Be the first to plunder the riches!</td>
                `;
                leaderboardBody.appendChild(row);
            }
        }
    }
}

// Update stats display
async function updateStats() {
    try {
        // First, get high scores from the server API
        const response = await fetch('/api/high-scores');
        let serverHighScores = [];
        
        if (response.ok) {
            serverHighScores = await response.json();
        } else {
            console.error('Failed to fetch high scores from server:', response.status);
        }
        
        // Combine server high scores with localStorage high scores
        let allPlayers = [...serverHighScores];
        
        // Add localStorage players if not already in the list
        players.forEach(player => {
            if (!allPlayers.some(p => p.name === player.name)) {
                allPlayers.push({
                    name: player.name,
                    score: player.balance,
                    timestamp: player.lastPlayed
                });
            }
        });
        
        if (allPlayers.length === 0) {
            totalPlayersElement.textContent = '0';
            biggestWinEverElement.textContent = '0';
            mostRecentWinnerElement.textContent = 'None';
            return;
        }
        
        // Calculate total players
        totalPlayersElement.textContent = allPlayers.length;
        
        // Find biggest win ever
        const biggestWinEver = Math.max(...allPlayers.map(player => {
            return player.score !== undefined ? player.score : player.biggestWin;
        }));
        biggestWinEverElement.textContent = biggestWinEver;
        
        // Find most recent winner (player with a win who played most recently)
        const winnersWithDate = allPlayers
            .filter(player => {
                const score = player.score !== undefined ? player.score : player.biggestWin;
                return score > 0;
            })
            .sort((a, b) => {
                const dateA = new Date(a.timestamp || a.lastPlayed || 0);
                const dateB = new Date(b.timestamp || b.lastPlayed || 0);
                return dateB - dateA;
            });
        
        mostRecentWinnerElement.textContent = winnersWithDate.length > 0 ? winnersWithDate[0].name : 'None';
    } catch (error) {
        console.error('Error updating stats:', error);
        
        // Fallback to localStorage only if there's an error
        if (players.length === 0) {
            totalPlayersElement.textContent = '0';
            biggestWinEverElement.textContent = '0';
            mostRecentWinnerElement.textContent = 'None';
            return;
        }
        
        // Calculate total players
        totalPlayersElement.textContent = players.length;
        
        // Find biggest win ever
        const biggestWinEver = Math.max(...players.map(player => player.balance));
        biggestWinEverElement.textContent = biggestWinEver;
        
        // Find most recent winner (player with a win who played most recently)
        const winnersWithDate = players
            .filter(player => player.balance > 0)
            .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
        
        mostRecentWinnerElement.textContent = winnersWithDate.length > 0 ? winnersWithDate[0].name : 'None';
    }
}

// Start the high score board when the page loads
window.addEventListener('load', init);