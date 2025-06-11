import { Player } from './Player.js';

/**
 * AI Player with hunt and target strategies
 */
export class AIPlayer extends Player {
  constructor(name = 'CPU') {
    super(name);
    this.mode = 'hunt'; // 'hunt' or 'target'
    this.targetQueue = [];
    this.lastHit = null;
  }

  /**
   * Make an AI guess using hunt or target strategy
   * @param {Board} opponentBoard - The opponent's board to guess on
   * @returns {string} Coordinate to guess
   */
  makeGuess(opponentBoard) {
    let coordinate;

    if (this.mode === 'target' && this.targetQueue.length > 0) {
      coordinate = this.targetQueue.shift();
    } else {
      this.mode = 'hunt';
      coordinate = this.generateHuntGuess(opponentBoard);
    }

    return coordinate;
  }

  /**
   * Generate a random guess during hunt mode
   * @param {Board} opponentBoard - The opponent's board
   * @returns {string} Random valid coordinate
   */
  generateHuntGuess(opponentBoard) {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const row = Math.floor(Math.random() * opponentBoard.size);
      const col = Math.floor(Math.random() * opponentBoard.size);
      
      if (opponentBoard.isValidGuess(row, col)) {
        return `${row}${col}`;
      }
      attempts++;
    }

    // Fallback: find any valid guess
    for (let row = 0; row < opponentBoard.size; row++) {
      for (let col = 0; col < opponentBoard.size; col++) {
        if (opponentBoard.isValidGuess(row, col)) {
          return `${row}${col}`;
        }
      }
    }

    throw new Error('No valid guesses available');
  }

  /**
   * Process the result of a guess and update AI strategy
   * @param {string} coordinate - The coordinate that was guessed
   * @param {Object} result - Result of the guess
   * @param {Board} opponentBoard - The opponent's board
   */
  processGuessResult(coordinate, result, opponentBoard) {
    if (result.hit) {
      this.lastHit = coordinate;
      
      if (result.sunk) {
        // Ship was sunk, return to hunt mode
        this.mode = 'hunt';
        this.targetQueue = [];
        this.lastHit = null;
      } else {
        // Hit but not sunk, switch to target mode
        this.mode = 'target';
        this.addAdjacentTargets(coordinate, opponentBoard);
      }
    } else {
      // Miss - if we were in target mode and queue is empty, return to hunt
      if (this.mode === 'target' && this.targetQueue.length === 0) {
        this.mode = 'hunt';
        this.lastHit = null;
      }
    }
  }

  /**
   * Add adjacent coordinates to target queue
   * @param {string} coordinate - Center coordinate to find adjacents for
   * @param {Board} opponentBoard - The opponent's board
   */
  addAdjacentTargets(coordinate, opponentBoard) {
    const adjacents = opponentBoard.getAdjacentCoordinates(coordinate);
    
    // Add new adjacent coordinates that aren't already in queue
    adjacents.forEach(adj => {
      if (!this.targetQueue.includes(adj)) {
        this.targetQueue.push(adj);
      }
    });
  }

  /**
   * Get current AI mode
   * @returns {string} Current mode ('hunt' or 'target')
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get current target queue
   * @returns {string[]} Array of coordinates in target queue
   */
  getTargetQueue() {
    return [...this.targetQueue];
  }

  /**
   * Reset AI strategy (useful for new games)
   */
  resetStrategy() {
    this.mode = 'hunt';
    this.targetQueue = [];
    this.lastHit = null;
  }
} 