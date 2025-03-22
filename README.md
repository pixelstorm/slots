# Pirate's Treasure Slot Machine Game

A Node.js-based slot machine game with a pirate theme, player management, and high score tracking.

## Features

- **Pirate-themed slot machine** with animated reels and sound effects
- **Player management** system that saves player data
- **Leaderboard** to track and display high scores
- **Persistent storage** of player data and high scores
- **Responsive design** that works on different screen sizes

## Technologies Used

- **Node.js** for the server-side logic
- **Express** for the web server and API endpoints
- **HTML/CSS/JavaScript** for the frontend
- **LocalStorage** for client-side data persistence
- **Server-side JSON storage** for high scores

## How to Play

1. Enter your pirate name to start the game
2. Adjust your bet amount using the + and - buttons
3. Click the SPIN button to spin the reels
4. Match symbols to win gold!
5. View the leaderboard to see how you rank against other pirates

## Winning Combinations

- **Three matching symbols**: Jackpot! Win the full value of the symbols
- **Two matching symbols**: Partial win based on the symbol value

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `index.html` - Main game page
- `leaderboard.html` - Standalone leaderboard page
- `script.js` - Main game logic
- `leaderboard.js` - Leaderboard functionality
- `style.css` - Game styling
- `server.js` - Express server and API endpoints
- `api.js` - Client-side API functions
- `high-scores.json` - Persistent storage for high scores

## Game Mechanics

- Players start with 1000 gold
- Minimum bet is 50 gold
- Maximum bet is 1000 gold
- Each symbol has a different value:
  - Skull: 10x
  - Coin: 20x
  - Sword: 30x
  - Map: 40x
  - Ship: 50x
  - Chest: 100x

## Leaderboard

The leaderboard tracks:
- Player names
- Current gold amount
- Date of last play

Players can view the leaderboard at any time by clicking the "TREASURE BOARD" button.

## Future Enhancements

- Add more symbols and winning combinations
- Implement bonus rounds and special features
- Add sound volume controls
- Create a multiplayer mode
- Add animations for big wins