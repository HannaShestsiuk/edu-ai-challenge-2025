import { Ship } from './Ship.js';

/**
 * Represents a game board in the Sea Battle game
 */
export class Board {
  constructor(size = 10) {
    this.size = size;
    this.grid = this.createEmptyGrid();
    this.ships = [];
    this.guesses = new Set();
  }

  /**
   * Create an empty grid filled with water symbols
   * @returns {string[][]} Empty grid
   */
  createEmptyGrid() {
    return Array(this.size).fill(null).map(() => Array(this.size).fill('~'));
  }

  /**
   * Place a ship randomly on the board
   * @param {number} shipLength - Length of the ship to place
   * @returns {Ship|null} The placed ship or null if placement failed
   */
  placeShipRandomly(shipLength = 3) {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const maxRow = orientation === 'horizontal' ? this.size : this.size - shipLength + 1;
      const maxCol = orientation === 'horizontal' ? this.size - shipLength + 1 : this.size;
      
      const startRow = Math.floor(Math.random() * maxRow);
      const startCol = Math.floor(Math.random() * maxCol);

      if (this.canPlaceShip(startRow, startCol, shipLength, orientation)) {
        const ship = new Ship(shipLength);
        ship.place(startRow, startCol, orientation);
        this.ships.push(ship);
        this.updateGridForShip(ship);
        return ship;
      }
      attempts++;
    }
    return null;
  }

  /**
   * Check if a ship can be placed at the given position
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {number} length - Ship length
   * @param {string} orientation - 'horizontal' or 'vertical'
   * @returns {boolean} True if placement is valid
   */
  canPlaceShip(startRow, startCol, length, orientation) {
    const occupiedLocations = this.getAllShipLocations();
    
    for (let i = 0; i < length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      
      if (row >= this.size || col >= this.size) {
        return false;
      }
      
      const location = `${row}${col}`;
      if (occupiedLocations.includes(location)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Update the grid to show ship placement (for player's own board)
   * @param {Ship} ship - The ship to show on grid
   */
  updateGridForShip(ship) {
    ship.getLocations().forEach(location => {
      const row = parseInt(location[0]);
      const col = parseInt(location[1]);
      this.grid[row][col] = 'S';
    });
  }

  /**
   * Get all locations occupied by ships
   * @returns {string[]} Array of coordinate strings
   */
  getAllShipLocations() {
    return this.ships.flatMap(ship => ship.getLocations());
  }

  /**
   * Process a guess on this board
   * @param {string} coordinate - Coordinate string (e.g., "34")
   * @returns {Object} Result object with hit, sunk, and ship information
   */
  processGuess(coordinate) {
    if (this.guesses.has(coordinate)) {
      return { alreadyGuessed: true, hit: false, sunk: false };
    }

    this.guesses.add(coordinate);
    const row = parseInt(coordinate[0]);
    const col = parseInt(coordinate[1]);

    // Check for hits
    for (const ship of this.ships) {
      if (ship.checkHit(coordinate)) {
        this.grid[row][col] = 'X';
        return {
          alreadyGuessed: false,
          hit: true,
          sunk: ship.isSunk(),
          ship: ship
        };
      }
    }

    // Miss
    this.grid[row][col] = 'O';
    return { alreadyGuessed: false, hit: false, sunk: false };
  }

  /**
   * Check if coordinate is valid and not already guessed
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} True if valid and new
   */
  isValidGuess(row, col) {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return false;
    }
    const coordinate = `${row}${col}`;
    return !this.guesses.has(coordinate);
  }

  /**
   * Get the current state of the grid
   * @returns {string[][]} Current grid state
   */
  getGrid() {
    return this.grid.map(row => [...row]);
  }

  /**
   * Get adjacent coordinates for targeting mode
   * @param {string} coordinate - Center coordinate
   * @returns {string[]} Array of valid adjacent coordinates
   */
  getAdjacentCoordinates(coordinate) {
    const row = parseInt(coordinate[0]);
    const col = parseInt(coordinate[1]);
    
    const adjacent = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 }
    ];

    return adjacent
      .filter(pos => this.isValidGuess(pos.r, pos.c))
      .map(pos => `${pos.r}${pos.c}`);
  }

  /**
   * Count remaining ships
   * @returns {number} Number of ships not yet sunk
   */
  getRemainingShips() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Check if all ships are sunk
   * @returns {boolean} True if all ships are sunk
   */
  allShipsSunk() {
    return this.ships.every(ship => ship.isSunk());
  }
} 