/**
 * Utility functions for the Sea Battle game
 */
export class GameUtils {
  /**
   * Validate player input for coordinates
   * @param {string} input - User input to validate
   * @returns {Object} Validation result with isValid, row, col, and error message
   */
  static validateInput(input) {
    if (input === null || input === undefined || typeof input !== 'string') {
      return {
        isValid: false,
        error: 'Input must be a string'
      };
    }

    const trimmed = input.trim();
    
    if (trimmed.length !== 2) {
      return {
        isValid: false,
        error: 'Input must be exactly two digits (e.g., 00, 34, 98)'
      };
    }

    const row = parseInt(trimmed[0]);
    const col = parseInt(trimmed[1]);

    if (isNaN(row) || isNaN(col)) {
      return {
        isValid: false,
        error: 'Both characters must be digits'
      };
    }

    if (row < 0 || row > 9 || col < 0 || col > 9) {
      return {
        isValid: false,
        error: 'Both digits must be between 0 and 9'
      };
    }

    return {
      isValid: true,
      row,
      col,
      coordinate: trimmed
    };
  }

  /**
   * Create a deep copy of a 2D array
   * @param {Array<Array>} array - 2D array to copy
   * @returns {Array<Array>} Deep copy of the array
   */
  static deepCopy2D(array) {
    return array.map(row => [...row]);
  }

  /**
   * Parse coordinate string to row and column numbers
   * @param {string} coordinate - Coordinate string (e.g., "34")
   * @returns {Object} Object with row and col properties
   */
  static parseCoordinate(coordinate) {
    return {
      row: parseInt(coordinate[0]),
      col: parseInt(coordinate[1])
    };
  }

  /**
   * Format coordinate from row and column to string
   * @param {number} row - Row number
   * @param {number} col - Column number
   * @returns {string} Formatted coordinate string
   */
  static formatCoordinate(row, col) {
    return `${row}${col}`;
  }

  /**
   * Generate random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Check if two coordinates are adjacent (horizontally or vertically)
   * @param {string} coord1 - First coordinate
   * @param {string} coord2 - Second coordinate
   * @returns {boolean} True if coordinates are adjacent
   */
  static areAdjacent(coord1, coord2) {
    const pos1 = this.parseCoordinate(coord1);
    const pos2 = this.parseCoordinate(coord2);
    
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  /**
   * Calculate Manhattan distance between two coordinates
   * @param {string} coord1 - First coordinate
   * @param {string} coord2 - Second coordinate
   * @returns {number} Manhattan distance
   */
  static manhattanDistance(coord1, coord2) {
    const pos1 = this.parseCoordinate(coord1);
    const pos2 = this.parseCoordinate(coord2);
    
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
  }

  /**
   * Get all coordinates within a given distance from a center point
   * @param {string} center - Center coordinate
   * @param {number} distance - Maximum distance
   * @param {number} boardSize - Size of the board (default 10)
   * @returns {string[]} Array of coordinates within distance
   */
  static getCoordinatesWithinDistance(center, distance, boardSize = 10) {
    const centerPos = this.parseCoordinate(center);
    const coordinates = [];

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const coord = this.formatCoordinate(row, col);
        if (this.manhattanDistance(center, coord) <= distance && coord !== center) {
          coordinates.push(coord);
        }
      }
    }

    return coordinates;
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array (new array, original unchanged)
   */
  static shuffleArray(array) {
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  /**
   * Check if a coordinate is within board bounds
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @param {number} boardSize - Size of the board (default 10)
   * @returns {boolean} True if coordinate is within bounds
   */
  static isWithinBounds(row, col, boardSize = 10) {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
  }

  /**
   * Convert milliseconds to human-readable time string
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time string
   */
  static formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }
} 