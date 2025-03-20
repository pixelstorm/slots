# Pirate's Treasure Slot Machine

A pirate-themed slot machine game built with Node.js that supports player names and high score tracking.

## Features

- Pirate-themed slot machine game
- Player name registration
- High score tracking
- Persistent storage of player data
- Responsive design for various screen sizes
- Animated slot machine with sound effects

## Technologies Used

- Node.js
- Express.js
- HTML5
- CSS3
- JavaScript
- LocalStorage (for client-side data)
- JSON (for server-side data storage)

## Installation

1. Clone the repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. Enter your pirate name when prompted
2. Set your bet amount using the + and - buttons
3. Click the SPIN button to spin the reels
4. Match symbols to win gold!
5. Three matching symbols give the biggest payout
6. Two matching symbols give a smaller payout
7. View the Treasure Board to see the highest scores

## Game Symbols

- Skull: 10x bet multiplier
- Coin: 20x bet multiplier
- Sword: 30x bet multiplier
- Map: 40x bet multiplier
- Ship: 50x bet multiplier
- Treasure Chest: 100x bet multiplier (Jackpot!)

## High Score System

The game tracks each player's highest win amount. When a player achieves a new personal best, their score is updated on the Treasure Board. The leaderboard shows the top 10 players with the highest scores.

## Development

To run the game in development mode with automatic server restarts:

```bash
npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.