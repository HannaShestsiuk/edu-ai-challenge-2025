#!/usr/bin/env node

import { SeaBattleGame } from './src/SeaBattleGame.js';

/**
 * Main entry point for the Sea Battle game
 */
async function main() {
  console.log('🚢 Starting Sea Battle Game...\n');
  
  try {
    // Create game with default configuration
    const game = new SeaBattleGame({
      boardSize: 10,
      numShips: 3,
      shipLength: 3
    });
    
    // Start the game
    await game.start();
    
  } catch (error) {
    console.error('❌ Failed to start game:', error.message);
    process.exit(1);
  }
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Start the game
main(); 