// Pirate's Treasure Slot Machine - API Client

/**
 * API client for interacting with the server
 */
const API = {
    /**
     * Get all high scores from the server
     * @returns {Promise<Array>} Array of high scores
     */
    getHighScores: async function() {
        try {
            const response = await fetch('/api/high-scores');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching high scores:', error);
            return [];
        }
    },

    /**
     * Get a specific player's high score
     * @param {string} name - Player name
     * @returns {Promise<Object|null>} Player data or null if not found
     */
    getPlayerScore: async function(name) {
        try {
            const response = await fetch(`/api/high-scores/${encodeURIComponent(name)}`);
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching player score for ${name}:`, error);
            return null;
        }
    },

    /**
     * Save a player's high score
     * @param {string} name - Player name
     * @param {number} score - Player's high score
     * @param {string} timestamp - ISO timestamp of when the score was achieved
     * @returns {Promise<boolean>} Success status
     */
    saveHighScore: async function(name, score, timestamp = new Date().toISOString()) {
        try {
            const response = await fetch('/api/high-scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, score, timestamp })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error saving high score:', error);
            return false;
        }
    },

    /**
     * Update multiple players' scores at once (for skull curse feature)
     * @param {Array} updates - Array of player updates, each with name, score, and optional timestamp
     * @returns {Promise<boolean>} Success status
     */
    batchUpdateScores: async function(updates) {
        try {
            console.log('API.batchUpdateScores called with updates:', JSON.stringify(updates));
            
            const response = await fetch('/api/high-scores/batch-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ updates })
            });
            
            console.log('Batch update response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Batch update result:', result);
            return result.success;
        } catch (error) {
            console.error('Error batch updating scores:', error);
            return false;
        }
    },

    /**
     * Fallback to localStorage if server is unavailable
     */
    fallbackToLocalStorage: {
        /**
         * Save player data to localStorage
         * @param {Array} players - Array of player objects
         * @param {string} currentPlayerName - Current player's name
         * @returns {boolean} Success status
         */
        savePlayerData: function(players, currentPlayerName) {
            try {
                localStorage.setItem('pirateSlots_players', JSON.stringify(players));
                if (currentPlayerName) {
                    localStorage.setItem('pirateSlots_currentPlayer', currentPlayerName);
                }
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },

        /**
         * Load player data from localStorage
         * @returns {Object} Object containing players array and currentPlayer
         */
        loadPlayerData: function() {
            try {
                const playersData = localStorage.getItem('pirateSlots_players');
                const currentPlayerName = localStorage.getItem('pirateSlots_currentPlayer');
                
                let players = [];
                if (playersData) {
                    players = JSON.parse(playersData);
                }
                
                let currentPlayer = null;
                if (currentPlayerName && players.length > 0) {
                    currentPlayer = players.find(p => p.name === currentPlayerName);
                }
                
                return { players, currentPlayer };
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                return { players: [], currentPlayer: null };
            }
        }
    }
};

// Export the API for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}