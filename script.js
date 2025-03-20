// Pirate's Treasure Slot Machine Game
// Using 2D icons for clearer visuals

// Game configuration
const config = {
    reelCount: 3,
    symbolsPerReel: 10, // Number of symbols per reel
    visibleSymbols: 3, // Number of visible symbols in the view
    spinDuration: 2, // seconds
    initialBalance: 1000,
    defaultBet: 10,
    minBet: 5,
    maxBet: 100,
    betIncrement: 5,
    symbols: [
        { name: 'skull', icon: 'fa-skull', value: 10, color: 'var(--light-color)' },
        { name: 'coin', icon: 'fa-coins', value: 20, color: 'var(--gold)' },
        { name: 'sword', icon: 'fa-sword', value: 30, color: 'var(--silver)' },
        { name: 'map', icon: 'fa-map', value: 40, color: 'var(--rum-brown)' },
        { name: 'ship', icon: 'fa-ship', value: 50, color: 'var(--wood-brown)' },
        { name: 'chest', icon: 'fa-treasure-chest', value: 100, color: 'var(--primary-color)' }
    ],
    maxLeaderboardEntries: 10 // Maximum number of entries to show in the leaderboard
};

// Player data structure
class Player {
    constructor(name) {
        this.name = name;
        this.balance = config.initialBalance;
        this.biggestWin = 0;
        this.spins = 0;
        this.lastPlayed = new Date().toISOString();
    }
}

// Game state
const state = {
    balance: config.initialBalance,
    currentBet: config.defaultBet,
    spinning: false,
    reelResults: [],
    canSpin: true,
    reels: [],
    currentPlayer: null,
    players: [],
    biggestWin: 0
};

// Sound effects - using CDN-hosted sounds to avoid CORS issues
const sounds = {
    spin: new Howl({
        src: ['https://assets.codepen.io/21542/slot-machine-spin.mp3'],
        volume: 0.7
    }),
    win: new Howl({
        src: ['https://assets.codepen.io/21542/success-1.mp3'],
        volume: 0.8
    }),
    jackpot: new Howl({
        src: ['https://assets.codepen.io/21542/success-fanfare.mp3'],
        volume: 1.0
    }),
    buttonClick: new Howl({
        src: ['https://assets.codepen.io/21542/Click.mp3'],
        volume: 0.5
    }),
    reelStop: new Howl({
        src: ['https://assets.codepen.io/21542/Popup_02.mp3'],
        volume: 0.6
    }),
    pirateAmbience: new Howl({
        src: ['https://assets.codepen.io/21542/pirate-ship-ambience.mp3'],
        volume: 0.3,
        loop: true
    }),
    cannon: new Howl({
        src: ['https://assets.codepen.io/21542/cannon-fire.mp3'],
        volume: 0.4
    })
};

// DOM Elements
const spinButton = document.getElementById('spin-button');
const balanceElement = document.getElementById('balance');
const betAmountElement = document.getElementById('bet-amount');
const resultElement = document.getElementById('result');
const decreaseBetButton = document.getElementById('decrease-bet');
const increaseBetButton = document.getElementById('increase-bet');
const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const winLine = document.querySelector('.win-line');
const playerNameElement = document.getElementById('player-name');
const changePlayerButton = document.getElementById('change-player');
const playerModal = document.getElementById('player-modal');
const closeModalButton = document.querySelector('.close-modal');
const playerForm = document.getElementById('player-form');
const playerNameInput = document.getElementById('player-name-input');

// Initialize the game
function init() {
    // Initialize localStorage with default data if none exists
    initializeLocalStorage();
    
    // Load player data from localStorage
    loadPlayerData();
    
    // Show player modal if no current player
    if (!state.currentPlayer) {
        showPlayerModal();
    } else {
        updatePlayerDisplay();
    }
    
    // Update UI
    updateBalance();
    betAmountElement.textContent = state.currentBet;
    
    // Create reels
    createReels();
    
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
        if (playersData) {
            state.players = JSON.parse(playersData);
        }
        
        // Load current player
        const currentPlayerName = localStorage.getItem('pirateSlots_currentPlayer');
        if (currentPlayerName) {
            state.currentPlayer = state.players.find(player => player.name === currentPlayerName);
            
            // If player exists, update game state with player data
            if (state.currentPlayer) {
                state.balance = state.currentPlayer.balance;
                state.biggestWin = state.currentPlayer.biggestWin;
            } else {
                // No current player found, will show modal
                state.currentPlayer = null;
            }
        } else {
            // No current player, will show modal
            state.currentPlayer = null;
        }
    } catch (error) {
        console.error('Error loading player data:', error);
        // Error loading player data, will show modal
        state.currentPlayer = null;
    }
}

// Save player data to localStorage
// This function saves the player's highest score to the high score board
// The highest score is updated when a player achieves a new biggest win
function savePlayerData() {
    try {
        // Update current player data
        if (state.currentPlayer) {
            console.log('Saving player data for:', state.currentPlayer.name);
            console.log('Current balance:', state.balance);
            console.log('Current biggest win:', state.biggestWin);
            
            state.currentPlayer.balance = state.balance;
            state.currentPlayer.biggestWin = state.biggestWin;
            state.currentPlayer.lastPlayed = new Date().toISOString();
            
            // Find player in array and update
            const playerIndex = state.players.findIndex(p => p.name === state.currentPlayer.name);
            if (playerIndex !== -1) {
                console.log('Updating existing player at index:', playerIndex);
                state.players[playerIndex] = state.currentPlayer;
            } else {
                // Add player if not found
                console.log('Adding new player to players array');
                state.players.push(state.currentPlayer);
            }
            
            console.log('Players array before saving:', state.players);
            
            // Save to localStorage
            localStorage.setItem('pirateSlots_players', JSON.stringify(state.players));
            localStorage.setItem('pirateSlots_currentPlayer', state.currentPlayer.name);
            
            // Verify data was saved correctly
            const savedData = localStorage.getItem('pirateSlots_players');
            console.log('Saved player data:', savedData);
        }
    } catch (error) {
        console.error('Error saving player data:', error);
    }
}

// Create a new player
function createNewPlayer(name) {
    // Check if player already exists
    const existingPlayer = state.players.find(player => player.name === name);
    
    if (existingPlayer) {
        // Use existing player
        state.currentPlayer = existingPlayer;
        state.balance = existingPlayer.balance;
        state.biggestWin = existingPlayer.biggestWin;
    } else {
        // Create new player
        const newPlayer = new Player(name);
        state.players.push(newPlayer);
        state.currentPlayer = newPlayer;
        state.balance = newPlayer.balance;
        state.biggestWin = newPlayer.biggestWin;
    }
    
    // Update UI
    updatePlayerDisplay();
    savePlayerData();
}

// Update player display
function updatePlayerDisplay() {
    if (state.currentPlayer) {
        playerNameElement.textContent = state.currentPlayer.name;
    }
}

// Show player modal
function showPlayerModal() {
    playerModal.style.display = 'block';
    playerNameInput.focus();
}

// Hide player modal
function hidePlayerModal() {
    playerModal.style.display = 'none';
}

// Check if player is broke and offer reset
function checkPlayerBroke() {
    if (state.currentPlayer && state.balance < config.minBet) {
        // Player is broke - can't place minimum bet
        const resetBalance = confirm(`Ye be out of gold, matey! Would ye like to reset yer balance to $${config.initialBalance}?`);
        
        if (resetBalance) {
            // Reset balance but keep stats
            state.balance = config.initialBalance;
            state.currentPlayer.balance = config.initialBalance;
            updateBalance();
            savePlayerData();
            showResult("Yer gold has been reset. Good luck, sailor!");
        }
    }
}

// Create the reels with symbols
function createReels() {
    // Fix for the chest icon which isn't in Font Awesome
    config.symbols[5].icon = 'fa-treasure-chest';
    
    for (let i = 0; i < config.reelCount; i++) {
        const symbolsContainer = reelElements[i].querySelector('.symbols-container');
        const symbols = [];
        
        // Create symbols for this reel
        for (let j = 0; j < config.symbolsPerReel; j++) {
            // Randomly select a symbol
            const randomIndex = Math.floor(Math.random() * config.symbols.length);
            const symbolData = config.symbols[randomIndex];
            
            // Create symbol element
            const symbolElement = document.createElement('div');
            symbolElement.className = `symbol ${symbolData.name}`;
            
            // Special case for chest which isn't in Font Awesome
            if (symbolData.name === 'chest') {
                symbolElement.innerHTML = `<i class="fas fa-box-open" style="color: ${symbolData.color}"></i>`;
            } else if (symbolData.name === 'sword') {
                symbolElement.innerHTML = `<i class="fas fa-khanda" style="color: ${symbolData.color}"></i>`;
            } else {
                symbolElement.innerHTML = `<i class="fas ${symbolData.icon}" style="color: ${symbolData.color}"></i>`;
            }
            
            // Add to container
            symbolsContainer.appendChild(symbolElement);
            
            // Store symbol data
            symbols.push({
                element: symbolElement,
                data: symbolData,
                index: randomIndex
            });
        }
        
        // Store reel data
        state.reels.push({
            element: reelElements[i],
            symbolsContainer: symbolsContainer,
            symbols: symbols,
            currentPosition: 0,
            targetPosition: 0,
            spinning: false
        });
    }
    
    // Position the reels to show symbols in the center
    positionReels();
}

// Position reels to show symbols properly
function positionReels() {
    state.reels.forEach(reel => {
        // Wait for DOM to be ready and elements to have height
        setTimeout(() => {
            const symbolHeight = reel.symbols[0].element.offsetHeight || 100;
            const initialOffset = -symbolHeight * (config.symbolsPerReel - config.visibleSymbols) / 2;
            reel.symbolsContainer.style.transform = `translateY(${initialOffset}px)`;
            reel.currentPosition = initialOffset;
        }, 100);
    });
}

// Start spinning the reels
function spinReels() {
    if (state.spinning || !state.canSpin) return;
    
    // Check if player has enough balance
    if (state.balance < state.currentBet) {
        showResult("Not enough gold to spin, matey!");
        
        // Check if player is broke and offer reset
        checkPlayerBroke();
        return;
    }
    
    // Deduct bet from balance
    state.balance -= state.currentBet;
    updateBalance();
    
    // Clear previous results
    showResult("");
    state.reelResults = [];
    winLine.classList.remove('show');
    
    // Start spinning animation
    state.spinning = true;
    state.canSpin = false;
    sounds.spin.play();
    
    // Spin each reel
    state.reels.forEach((reel, i) => {
        // Set spinning state
        reel.spinning = true;
        
        // Add spinning class for animation
        reel.symbolsContainer.classList.add('spinning');
        
        // Determine when this reel will stop (staggered)
        const stopTime = (config.spinDuration * 1000) + (i * 500);
        
        // Randomly select the final symbols for this reel
        const symbolHeight = reel.symbols[0].element.offsetHeight;
        const randomStopPosition = Math.floor(Math.random() * config.symbols.length);
        
        // Calculate the target position
        const targetPosition = -symbolHeight * randomStopPosition;
        
        // Store the target position and result
        reel.targetPosition = targetPosition;
        state.reelResults.push(reel.symbols[randomStopPosition].data);
        
        // Stop the reel after the delay
        setTimeout(() => {
            stopReel(i, randomStopPosition);
        }, stopTime);
    });
}

// Stop a reel at the specified position
function stopReel(reelIndex, symbolIndex) {
    const reel = state.reels[reelIndex];
    
    // Remove spinning class
    reel.symbolsContainer.classList.remove('spinning');
    
    // Set the final position
    const symbolHeight = reel.symbols[0].element.offsetHeight;
    const centerOffset = symbolHeight * (config.visibleSymbols - 1) / 2;
    const finalPosition = -symbolHeight * symbolIndex + centerOffset;
    
    // Apply the final position with a smooth transition
    reel.symbolsContainer.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    reel.symbolsContainer.style.transform = `translateY(${finalPosition}px)`;
    
    // Play stop sound
    sounds.reelStop.play();
    
    // Update reel state
    reel.spinning = false;
    reel.currentPosition = finalPosition;
    
    // Check if all reels have stopped
    if (state.reels.every(r => !r.spinning)) {
        setTimeout(() => {
            checkWin();
            state.spinning = false;
            state.canSpin = true;
        }, 500);
    }
}

// Check for winning combinations
function checkWin() {
    // Get the symbols that landed on each reel
    const landedSymbols = state.reelResults;
    
    // Check if all symbols are the same (jackpot)
    const allSame = landedSymbols.every(symbol => symbol.name === landedSymbols[0].name);
    
    if (allSame) {
        // Jackpot win!
        const symbolValue = landedSymbols[0].value;
        const winAmount = state.currentBet * symbolValue;
        
        state.balance += winAmount;
        updateBalance();
        
        // Update biggest win if this is larger
        if (winAmount > state.biggestWin) {
            console.log('New biggest win:', winAmount, 'Previous biggest win:', state.biggestWin);
            state.biggestWin = winAmount;
            if (state.currentPlayer) {
                console.log('Updating player biggest win for:', state.currentPlayer.name);
                state.currentPlayer.biggestWin = winAmount;
            }
        }
        
        // Play jackpot sound and cannon sound
        sounds.jackpot.play();
        sounds.cannon.play();
        
        // Show win message with animation
        resultElement.classList.add('win-animation');
        document.getElementById('slot-machine').classList.add('sunset-glow');
        winLine.classList.add('show');
        
        showResult(`PIRATE'S TREASURE! Ye won $${winAmount}!`);
        
        // Remove animation classes after they complete
        setTimeout(() => {
            resultElement.classList.remove('win-animation');
            document.getElementById('slot-machine').classList.remove('sunset-glow');
            winLine.classList.remove('show');
        }, 3000);
    } else {
        // Check for partial matches (2 of a kind)
        const symbolCounts = {};
        landedSymbols.forEach(symbol => {
            symbolCounts[symbol.name] = (symbolCounts[symbol.name] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(symbolCounts));
        
        if (maxCount >= 2) {
            // Partial win with 2 or more matching symbols
            const matchingSymbol = Object.keys(symbolCounts).find(key => symbolCounts[key] === maxCount);
            const symbolObj = config.symbols.find(s => s.name === matchingSymbol);
            
            // Calculate win amount (smaller than jackpot)
            const winAmount = Math.floor(state.currentBet * (symbolObj.value / 2) * (maxCount / 3));
            
            state.balance += winAmount;
            updateBalance();
            
            // Update biggest win if this is larger
            if (winAmount > state.biggestWin) {
                console.log('New biggest win (partial):', winAmount, 'Previous biggest win:', state.biggestWin);
                state.biggestWin = winAmount;
                if (state.currentPlayer) {
                    console.log('Updating player biggest win for:', state.currentPlayer.name);
                    state.currentPlayer.biggestWin = winAmount;
                }
            }
            
            // Play win sound
            sounds.win.play();
            
            // Show win message with mild animation
            resultElement.classList.add('win-animation');
            winLine.classList.add('show');
            
            // Format the symbol name for display
            const formattedSymbol = matchingSymbol.replace('-', ' ');
            
            showResult(`Ye won $${winAmount} with ${maxCount} ${formattedSymbol}s!`);
            
            // Remove animation class after it completes
            setTimeout(() => {
                resultElement.classList.remove('win-animation');
                winLine.classList.remove('show');
            }, 2000);
        } else {
            // No win
            showResult("No treasure this time, matey!");
        }
    }
    
    // Save player data after each spin
    savePlayerData();
}

// Update the balance display
function updateBalance() {
    balanceElement.textContent = state.balance;
}

// Show result message
function showResult(message) {
    resultElement.textContent = message;
}

// Increase bet amount
function increaseBet() {
    if (state.currentBet < config.maxBet) {
        state.currentBet += config.betIncrement;
        betAmountElement.textContent = state.currentBet;
    }
    sounds.buttonClick.play();
}

// Decrease bet amount
function decreaseBet() {
    if (state.currentBet > config.minBet) {
        state.currentBet -= config.betIncrement;
        betAmountElement.textContent = state.currentBet;
    }
    sounds.buttonClick.play();
}

// Event listeners
spinButton.addEventListener('click', () => {
    if (!state.spinning && state.canSpin) {
        spinReels();
        sounds.buttonClick.play();
        
        // Increment spin count for current player
        if (state.currentPlayer) {
            state.currentPlayer.spins++;
        }
    }
});

decreaseBetButton.addEventListener('click', decreaseBet);
increaseBetButton.addEventListener('click', increaseBet);

// Player modal event listeners
changePlayerButton.addEventListener('click', () => {
    showPlayerModal();
    sounds.buttonClick.play();
});

closeModalButton.addEventListener('click', () => {
    hidePlayerModal();
    sounds.buttonClick.play();
});

playerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const playerName = playerNameInput.value.trim();
    
    if (playerName) {
        createNewPlayer(playerName);
        hidePlayerModal();
        sounds.buttonClick.play();
        
        // Update UI
        updateBalance();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (!state.spinning) {
        positionReels();
    }
});

// Handle clicks outside the modal to close it
window.addEventListener('click', (e) => {
    if (e.target === playerModal) {
        hidePlayerModal();
    }
});

// Leaderboard Modal Elements
const leaderboardModal = document.getElementById('leaderboard-modal');
const closeLeaderboardBtn = document.querySelector('.close-leaderboard');
const closeLeaderboardButton = document.getElementById('close-leaderboard-button');
const highScoreBody = document.getElementById('high-score-body');
const noScoresMessage = document.getElementById('no-scores-message');
const totalPlayersElement = document.getElementById('total-players');
const biggestWinEverElement = document.getElementById('biggest-win-ever');
const mostRecentWinnerElement = document.getElementById('most-recent-winner');

// Add event listener to the "View High Scores" button
document.getElementById('view-high-scores').addEventListener('click', (e) => {
    // Ensure player data is saved before showing leaderboard
    if (state.currentPlayer) {
        console.log('Saving player data before showing leaderboard');
        
        // Update current player data with latest values
        state.currentPlayer.balance = state.balance;
        state.currentPlayer.biggestWin = state.biggestWin;
        state.currentPlayer.lastPlayed = new Date().toISOString();
        
        // Find player in array and update
        const playerIndex = state.players.findIndex(p => p.name === state.currentPlayer.name);
        if (playerIndex !== -1) {
            state.players[playerIndex] = state.currentPlayer;
        } else {
            // Add player if not found
            state.players.push(state.currentPlayer);
        }
        
        // Save to localStorage
        localStorage.setItem('pirateSlots_players', JSON.stringify(state.players));
        localStorage.setItem('pirateSlots_currentPlayer', state.currentPlayer.name);
        
        // Force a localStorage sync by reading the data back
        const savedData = localStorage.getItem('pirateSlots_players');
        console.log('Verified saved player data:', savedData);
    }
    
    // Update the leaderboard with the latest data
    updateLeaderboard();
    
    // Show the leaderboard modal
    leaderboardModal.style.display = 'block';
});

// Close the leaderboard modal when clicking the X
closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardModal.style.display = 'none';
});

// Close the leaderboard modal when clicking the "Back to Game" button
closeLeaderboardButton.addEventListener('click', () => {
    leaderboardModal.style.display = 'none';
});

// Close the leaderboard modal when clicking the top "Back to Game" button
document.getElementById('top-close-leaderboard-button').addEventListener('click', () => {
    leaderboardModal.style.display = 'none';
});

// Close the leaderboard modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === leaderboardModal) {
        leaderboardModal.style.display = 'none';
    }
});

// Function to update the leaderboard with the latest data
async function updateLeaderboard() {
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
        
        // Get the latest player data from localStorage as a fallback
        const playersData = JSON.parse(localStorage.getItem('pirateSlots_players') || '[]');
        const currentPlayerName = localStorage.getItem('pirateSlots_currentPlayer');
        
        console.log('Updating leaderboard with players:', playersData);
        console.log('Current player name:', currentPlayerName);
        
        // Clear the existing high scores
        highScoreBody.innerHTML = '';
        
        // Combine server high scores with localStorage high scores
        let allPlayers = [...serverHighScores];
        
        // Add current player if not already in the list
        if (currentPlayerName) {
            const currentPlayer = playersData.find(p => p.name === currentPlayerName);
            if (currentPlayer && !allPlayers.some(p => p.name === currentPlayerName)) {
                allPlayers.push({
                    name: currentPlayer.name,
                    score: currentPlayer.biggestWin,
                    timestamp: currentPlayer.lastPlayed
                });
            }
        }
        
        if (allPlayers.length === 0) {
            // Show the "no scores" message if there are no players
            noScoresMessage.style.display = 'block';
            totalPlayersElement.textContent = '0';
            biggestWinEverElement.textContent = '$0';
            mostRecentWinnerElement.textContent = 'None';
            return;
        }
        
        // Hide the "no scores" message
        noScoresMessage.style.display = 'none';
        
        // Sort players by score (descending)
        const sortedPlayers = [...allPlayers].sort((a, b) => {
            // For server players, use score
            const scoreA = a.score !== undefined ? a.score : a.biggestWin;
            const scoreB = b.score !== undefined ? b.score : b.biggestWin;
            return scoreB - scoreA;
        });
        
        // Get the top players to display (up to 10)
        const topPlayers = sortedPlayers.slice(0, 10);
        
        // Add each player to the high score table
        topPlayers.forEach((player, index) => {
            const row = document.createElement('tr');
            
            // Highlight the current player's row
            if (player.name === currentPlayerName) {
                row.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            }
            
            // Format the date
            const timestamp = player.timestamp || player.lastPlayed || new Date().toISOString();
            const date = new Date(timestamp);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            
            // Get the score (handle both server and localStorage formats)
            const score = player.score !== undefined ? player.score : player.biggestWin;
            
            row.innerHTML = `
                <td style="padding: 10px; text-align: center; color: var(--gold); font-weight: bold;">${index + 1}</td>
                <td style="padding: 10px; text-align: center; color: white;">${player.name} ${player.name === currentPlayerName ? '<i class="fas fa-user"></i>' : ''}</td>
                <td style="padding: 10px; text-align: center; color: var(--accent-color);">$${score}</td>
                <td style="padding: 10px; text-align: center; color: white;">${formattedDate}</td>
            `;
            
            highScoreBody.appendChild(row);
        });
        
        // Update the stats
        totalPlayersElement.textContent = allPlayers.length;
        
        // Find the biggest win ever
        const biggestWinEver = Math.max(...allPlayers.map(p => p.score !== undefined ? p.score : p.biggestWin));
        biggestWinEverElement.textContent = `$${biggestWinEver}`;
        
        // Find the most recent winner
        const sortedByDate = [...allPlayers].sort((a, b) => {
            const dateA = new Date(a.timestamp || a.lastPlayed || 0);
            const dateB = new Date(b.timestamp || b.lastPlayed || 0);
            return dateB - dateA;
        });
        
        mostRecentWinnerElement.textContent = sortedByDate.length > 0 ? sortedByDate[0].name : 'None';
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        
        // Fallback to localStorage only if there's an error
        const playersData = JSON.parse(localStorage.getItem('pirateSlots_players') || '[]');
        if (playersData.length > 0) {
            // Display localStorage data only
            highScoreBody.innerHTML = '';
            
            const sortedPlayers = [...playersData].sort((a, b) => b.biggestWin - a.biggestWin);
            const topPlayers = sortedPlayers.slice(0, 10);
            
            topPlayers.forEach((player, index) => {
                const row = document.createElement('tr');
                const date = new Date(player.lastPlayed);
                const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                
                row.innerHTML = `
                    <td style="padding: 10px; text-align: center; color: var(--gold); font-weight: bold;">${index + 1}</td>
                    <td style="padding: 10px; text-align: center; color: white;">${player.name}</td>
                    <td style="padding: 10px; text-align: center; color: var(--accent-color);">$${player.biggestWin}</td>
                    <td style="padding: 10px; text-align: center; color: white;">${formattedDate}</td>
                `;
                
                highScoreBody.appendChild(row);
            });
            
            totalPlayersElement.textContent = playersData.length;
            const biggestWinEver = Math.max(...playersData.map(p => p.biggestWin));
            biggestWinEverElement.textContent = `$${biggestWinEver}`;
            mostRecentWinnerElement.textContent = sortedPlayers[0].name;
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', init);