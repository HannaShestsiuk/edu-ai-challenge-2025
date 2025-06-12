/**
 * Handles all display and UI operations for the Sea Battle game
 */
export class GameDisplay {
  constructor() {
    this.boardSize = 10;
  }

  /**
   * Display welcome message and game instructions
   * @param {number} numShips - Number of ships in the game
   */
  showWelcome(numShips = 3) {
    console.log('\n🚢 Welcome to Sea Battle! 🚢');
    console.log('=====================================');
    console.log(`Try to sink the ${numShips} enemy ships.`);
    console.log('Enemy ships are hidden until you hit them!');
    console.log('🎯 Hit a ship? You get another turn!');
    console.log('\nSymbols:');
    console.log('  ~ = Water (unexplored)');
    console.log('  S = Your ships');
    console.log('  X = Hit');
    console.log('  O = Miss');
    console.log('\nEnter coordinates as two digits (e.g., 00, 34, 99)');
    console.log('=====================================\n');
  }

  /**
   * Display both game boards side by side
   * @param {string[][]} opponentGrid - Grid showing hits/misses on opponent board
   * @param {string[][]} playerGrid - Player's own board showing ships and hits
   */
  showBoards(opponentGrid, playerGrid) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    // Header with column numbers
    const header = this.createHeader();
    console.log(header + '     ' + header);

    // Display rows
    for (let i = 0; i < this.boardSize; i++) {
      let rowStr = i + ' ';
      
      // Opponent board row
      for (let j = 0; j < this.boardSize; j++) {
        rowStr += opponentGrid[i][j] + ' ';
      }
      
      rowStr += '    ' + i + ' ';
      
      // Player board row
      for (let j = 0; j < this.boardSize; j++) {
        rowStr += playerGrid[i][j] + ' ';
      }
      
      console.log(rowStr);
    }
    console.log();
  }

  /**
   * Create header row with column numbers
   * @returns {string} Formatted header string
   */
  createHeader() {
    let header = '  ';
    for (let h = 0; h < this.boardSize; h++) {
      header += h + ' ';
    }
    return header;
  }

  /**
   * Show player's turn prompt
   * @returns {Promise<string>} Promise that resolves with player's input
   */
  async promptPlayerTurn() {
    console.log('--- Your Turn ---');
    // This will be implemented with readline in the main game
    throw new Error('promptPlayerTurn should be implemented by game controller');
  }

  /**
   * Display result of player's guess
   * @param {string} coordinate - The coordinate guessed
   * @param {Object} result - Result of the guess
   */
  showPlayerGuessResult(coordinate, result) {
    if (result.alreadyGuessed) {
      console.log('❌ You already guessed that location!');
      return;
    }

    if (result.hit) {
      console.log(`🎯 PLAYER HIT at ${coordinate}!`);
      if (result.sunk) {
        console.log('💥 You sunk an enemy battleship!');
      }
    } else {
      console.log(`💧 PLAYER MISS at ${coordinate}.`);
    }
  }

  /**
   * Display CPU turn information
   * @param {string} coordinate - The coordinate CPU is guessing
   * @param {string} mode - AI mode ('hunt' or 'target')
   */
  showCPUTurn(coordinate, mode) {
    console.log('\n--- CPU\'s Turn ---');
    if (mode === 'target') {
      console.log(`🤖 CPU targets: ${coordinate}`);
    } else {
      console.log(`🤖 CPU hunts: ${coordinate}`);
    }
  }

  /**
   * Display result of CPU's guess
   * @param {string} coordinate - The coordinate CPU guessed
   * @param {Object} result - Result of the guess
   */
  showCPUGuessResult(coordinate, result) {
    if (result.hit) {
      console.log(`💥 CPU HIT at ${coordinate}!`);
      if (result.sunk) {
        console.log('⚡ CPU sunk your battleship!');
      }
    } else {
      console.log(`🌊 CPU MISS at ${coordinate}.`);
    }
  }

  /**
   * Display game over message
   * @param {boolean} playerWon - True if player won, false if CPU won
   * @param {string[][]} opponentGrid - Final opponent grid
   * @param {string[][]} playerGrid - Final player grid
   */
  showGameOver(playerWon, opponentGrid, playerGrid) {
    console.log('\n' + '='.repeat(50));
    
    if (playerWon) {
      console.log('🎉 CONGRATULATIONS! You sunk all enemy battleships! 🎉');
    } else {
      console.log('💀 GAME OVER! The CPU sunk all your battleships! 💀');
    }
    
    console.log('='.repeat(50));
    
    // Show final board state
    this.showBoards(opponentGrid, playerGrid);
  }

  /**
   * Display error message for invalid input
   * @param {string} input - The invalid input
   */
  showInvalidInput(input) {
    console.log(`❌ Invalid input: "${input}"`);
    console.log('Please enter exactly two digits (e.g., 00, 34, 98).');
    console.log('Each digit should be between 0 and 9.');
  }

  /**
   * Display initialization message
   * @param {string} message - Message to display
   */
  showInitialization(message) {
    console.log(`⚙️  ${message}`);
  }

  /**
   * Display current game status
   * @param {number} playerShips - Remaining player ships
   * @param {number} cpuShips - Remaining CPU ships
   */
  showGameStatus(playerShips, cpuShips) {
    console.log(`📊 Status: You have ${playerShips} ships | CPU has ${cpuShips} ships`);
  }

  /**
   * Clear console (if supported)
   */
  clearScreen() {
    console.clear();
  }

  /**
   * Display a separator line
   */
  showSeparator() {
    console.log('-'.repeat(70));
  }
}
