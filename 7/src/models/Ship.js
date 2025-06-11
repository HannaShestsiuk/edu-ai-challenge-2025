/**
 * Represents a ship in the Sea Battle game
 */
export class Ship {
  constructor(length = 3) {
    this.length = length;
    this.locations = [];
    this.hits = new Array(length).fill(false);
    this.orientation = null;
    this.startRow = null;
    this.startCol = null;
  }

  /**
   * Place the ship on the board
   * @param {number} startRow - Starting row position
   * @param {number} startCol - Starting column position
   * @param {string} orientation - 'horizontal' or 'vertical'
   */
  place(startRow, startCol, orientation) {
    this.startRow = startRow;
    this.startCol = startCol;
    this.orientation = orientation;
    this.locations = [];

    for (let i = 0; i < this.length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      this.locations.push(`${row}${col}`);
    }
  }

  /**
   * Check if a coordinate hits this ship
   * @param {string} coordinate - Coordinate string (e.g., "34")
   * @returns {boolean} True if hit, false otherwise
   */
  checkHit(coordinate) {
    const index = this.locations.indexOf(coordinate);
    if (index >= 0 && !this.hits[index]) {
      this.hits[index] = true;
      return true;
    }
    return false;
  }

  /**
   * Check if the ship is completely sunk
   * @returns {boolean} True if sunk, false otherwise
   */
  isSunk() {
    return this.hits.every(hit => hit === true);
  }

  /**
   * Get all coordinates occupied by this ship
   * @returns {string[]} Array of coordinate strings
   */
  getLocations() {
    return [...this.locations];
  }

  /**
   * Check if this ship overlaps with given coordinates
   * @param {string[]} coordinates - Array of coordinate strings
   * @returns {boolean} True if overlap exists
   */
  overlaps(coordinates) {
    return this.locations.some(location => coordinates.includes(location));
  }
} 