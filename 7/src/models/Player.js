import { Board } from './Board.js';

/**
 * Base class representing a player in the Sea Battle game
 */
export class Player {
  constructor(name = 'Player') {
    this.name = name;
    this.board = new Board();
    this.opponentBoard = new Board();
  }

  /**
   * Initialize the player by placing ships
   * @param {number} numShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   */
  initialize(numShips = 3, shipLength = 3) {
    for (let i = 0; i < numShips; i++) {
      const ship = this.board.placeShipRandomly(shipLength);
      if (!ship) {
        throw new Error(`Failed to place ship ${i + 1} for ${this.name}`);
      }
    }
  }

  /**
   * Make a guess on the opponent's board
   * @param {string} coordinate - Coordinate to guess (e.g., "34")
   * @returns {Object} Result of the guess
   */
  makeGuess(coordinate) {
    // This will be overridden by subclasses or implemented differently
    throw new Error('makeGuess method must be implemented');
  }

  /**
   * Receive a guess from opponent
   * @param {string} coordinate - Coordinate being guessed
   * @returns {Object} Result of the guess on this player's board
   */
  receiveGuess(coordinate) {
    return this.board.processGuess(coordinate);
  }

  /**
   * Check if this player has lost (all ships sunk)
   * @returns {boolean} True if all ships are sunk
   */
  hasLost() {
    return this.board.allShipsSunk();
  }

  /**
   * Get the player's board
   * @returns {Board} The player's board
   */
  getBoard() {
    return this.board;
  }

  /**
   * Get the opponent board (showing hits/misses)
   * @returns {Board} The opponent board view
   */
  getOpponentBoard() {
    return this.opponentBoard;
  }

  /**
   * Get number of remaining ships
   * @returns {number} Number of ships not yet sunk
   */
  getRemainingShips() {
    return this.board.getRemainingShips();
  }
} 