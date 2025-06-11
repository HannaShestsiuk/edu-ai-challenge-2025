import { Player } from './models/Player.js';
import { AIPlayer } from './models/AIPlayer.js';
import { GameDisplay } from './ui/GameDisplay.js';
import { GameUtils } from './utils/GameUtils.js';
import readline from 'readline';

/**
 * Main game controller for Sea Battle
 */
export class SeaBattleGame {
  constructor(config = {}) {
    this.config = {
      boardSize: config.boardSize || 10,
      numShips: config.numShips || 3,
      shipLength: config.shipLength || 3,
      ...config
    };

    this.player = new Player('Player');
    this.aiPlayer = new AIPlayer('CPU');
    this.display = new GameDisplay();
    this.gameOver = false;
    this.winner = null;
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Initialize and start the game
   */
  async start() {
    try {
      this.display.showWelcome(this.config.numShips);
      
      await this.initializePlayers();
      
      this.display.showInitialization('Game initialized. Let the battle begin!');
      
      await this.gameLoop();
      
    } catch (error) {
      console.error('❌ Game error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Initialize both players by placing their ships
   */
  async initializePlayers() {
    this.display.showInitialization('Placing your ships...');
    this.player.initialize(this.config.numShips, this.config.shipLength);
    
    this.display.showInitialization('Placing CPU ships...');
    this.aiPlayer.initialize(this.config.numShips, this.config.shipLength);
    
    this.display.showInitialization('All ships placed successfully!');
  }

  /**
   * Main game loop
   */
  async gameLoop() {
    while (!this.gameOver) {
      // Show current game state
      this.updateDisplay();
      
      // Player's turn
      const playerTurnCompleted = await this.handlePlayerTurn();
      
      if (this.gameOver) break;
      
      if (playerTurnCompleted) {
        // CPU's turn
        await this.handleCPUTurn();
      }
    }
    
    this.endGame();
  }

  /**
   * Handle player's turn
   * @returns {boolean} True if turn completed successfully
   */
  async handlePlayerTurn() {
    while (true) {
      try {
        const input = await this.promptInput('Enter your guess (e.g., 00): ');
        const validation = GameUtils.validateInput(input);
        
        if (!validation.isValid) {
          this.display.showInvalidInput(input);
          console.log(`Error: ${validation.error}`);
          continue;
        }
        
        const { coordinate } = validation;
        
        // Check if already guessed on opponent board
        if (this.player.opponentBoard.guesses.has(coordinate)) {
          console.log('❌ You already guessed that location!');
          continue;
        }
        
        // Process the guess
        const result = this.aiPlayer.receiveGuess(coordinate);
        this.player.opponentBoard.processGuess(coordinate);
        
        this.display.showPlayerGuessResult(coordinate, result);
        
        // Check for game over
        if (this.aiPlayer.hasLost()) {
          this.gameOver = true;
          this.winner = this.player;
        }
        
        return true;
        
      } catch (error) {
        console.error('Error during player turn:', error.message);
        return false;
      }
    }
  }

  /**
   * Handle CPU's turn
   */
  async handleCPUTurn() {
    const coordinate = this.aiPlayer.makeGuess(this.player.board);
    
    this.display.showCPUTurn(coordinate, this.aiPlayer.getMode());
    
    const result = this.player.receiveGuess(coordinate);
    
    // Update AI strategy based on result
    this.aiPlayer.processGuessResult(coordinate, result, this.player.board);
    
    this.display.showCPUGuessResult(coordinate, result);
    
    // Check for game over
    if (this.player.hasLost()) {
      this.gameOver = true;
      this.winner = this.aiPlayer;
    }
  }

  /**
   * Update and display current game state
   */
  updateDisplay() {
    const opponentGrid = this.player.opponentBoard.getGrid();
    const playerGrid = this.player.board.getGrid();
    
    this.display.showBoards(opponentGrid, playerGrid);
    this.display.showGameStatus(
      this.player.getRemainingShips(),
      this.aiPlayer.getRemainingShips()
    );
  }

  /**
   * End the game and show results
   */
  endGame() {
    const playerWon = this.winner === this.player;
    const opponentGrid = this.player.opponentBoard.getGrid();
    const playerGrid = this.player.board.getGrid();
    
    this.display.showGameOver(playerWon, opponentGrid, playerGrid);
  }

  /**
   * Prompt user for input
   * @param {string} question - Question to ask
   * @returns {Promise<string>} User's response
   */
  promptInput(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Get current game statistics
   * @returns {Object} Game statistics
   */
  getGameStats() {
    return {
      playerShips: this.player.getRemainingShips(),
      cpuShips: this.aiPlayer.getRemainingShips(),
      playerGuesses: this.player.opponentBoard.guesses.size,
      cpuGuesses: this.aiPlayer.board.guesses.size,
      cpuMode: this.aiPlayer.getMode(),
      gameOver: this.gameOver,
      winner: this.winner?.name || null
    };
  }

  /**
   * Reset the game for a new round
   */
  reset() {
    this.player = new Player('Player');
    this.aiPlayer = new AIPlayer('CPU');
    this.gameOver = false;
    this.winner = null;
  }
} 