import { Board } from '../../src/models/Board.js';
import { Ship } from '../../src/models/Ship.js';

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board(10);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create board with default size 10', () => {
      const defaultBoard = new Board();
      expect(defaultBoard.size).toBe(10);
      expect(defaultBoard.grid).toHaveLength(10);
      expect(defaultBoard.grid[0]).toHaveLength(10);
      expect(defaultBoard.ships).toEqual([]);
      expect(defaultBoard.guesses).toBeInstanceOf(Set);
      expect(defaultBoard.guesses.size).toBe(0);
    });

    test('should create board with custom size', () => {
      const customBoard = new Board(5);
      expect(customBoard.size).toBe(5);
      expect(customBoard.grid).toHaveLength(5);
      expect(customBoard.grid[0]).toHaveLength(5);
    });
  });

  describe('createEmptyGrid', () => {
    test('should create grid filled with water symbols', () => {
      const grid = board.createEmptyGrid();
      expect(grid).toHaveLength(10);
      expect(grid[0]).toHaveLength(10);
      expect(grid[0][0]).toBe('~');
      expect(grid[9][9]).toBe('~');
    });
  });

  describe('canPlaceShip', () => {
    test('should allow placement in empty area', () => {
      expect(board.canPlaceShip(2, 3, 3, 'horizontal')).toBe(true);
      expect(board.canPlaceShip(2, 3, 3, 'vertical')).toBe(true);
    });

    test('should prevent placement outside board boundaries', () => {
      expect(board.canPlaceShip(9, 8, 3, 'horizontal')).toBe(false); // Would go to column 10
      expect(board.canPlaceShip(8, 9, 3, 'vertical')).toBe(false); // Would go to row 10
      expect(board.canPlaceShip(10, 0, 3, 'horizontal')).toBe(false); // Invalid starting row
      expect(board.canPlaceShip(0, 10, 3, 'vertical')).toBe(false); // Invalid starting column
    });

    test('should prevent overlapping ship placement', () => {
      // Place first ship
      const ship1 = new Ship(3);
      ship1.place(2, 3, 'horizontal');
      board.ships.push(ship1);

      // Try to place overlapping ship
      expect(board.canPlaceShip(2, 2, 3, 'horizontal')).toBe(false); // Overlaps at 23, 24
      expect(board.canPlaceShip(1, 4, 3, 'vertical')).toBe(false); // Overlaps at 24
    });
  });

  describe('placeShipRandomly', () => {
    test('should place ship successfully', () => {
      const ship = board.placeShipRandomly(3);
      
      expect(ship).toBeInstanceOf(Ship);
      expect(ship.length).toBe(3);
      expect(board.ships).toContain(ship);
      expect(ship.locations).toHaveLength(3);
    });

    test('should return null when board is full', () => {
      // Fill board with ships to make placement impossible
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 8; j++) {
          const ship = new Ship(3);
          ship.place(i, j, 'horizontal');
          board.ships.push(ship);
        }
      }

      const ship = board.placeShipRandomly(3);
      expect(ship).toBeNull();
    });
  });

  describe('processGuess', () => {
    beforeEach(() => {
      // Place a ship for testing
      const ship = new Ship(3);
      ship.place(2, 3, 'horizontal');
      board.ships.push(ship);
      board.updateGridForShip(ship);
    });

    test('should return already guessed for repeated guess', () => {
      board.processGuess('23');
      const result = board.processGuess('23');
      
      expect(result.alreadyGuessed).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
    });

    test('should process hit correctly', () => {
      const result = board.processGuess('23');
      
      expect(result.alreadyGuessed).toBe(false);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      expect(result.ship).toBeInstanceOf(Ship);
      expect(board.grid[2][3]).toBe('X');
      expect(board.guesses.has('23')).toBe(true);
    });

    test('should process miss correctly', () => {
      const result = board.processGuess('22');
      
      expect(result.alreadyGuessed).toBe(false);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(board.grid[2][2]).toBe('O');
      expect(board.guesses.has('22')).toBe(true);
    });

    test('should detect sunk ship', () => {
      board.processGuess('23'); // First hit
      board.processGuess('24'); // Second hit
      const result = board.processGuess('25'); // Sinking hit
      
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(result.ship.isSunk()).toBe(true);
    });
  });

  describe('isValidGuess', () => {
    test('should return true for valid coordinates', () => {
      expect(board.isValidGuess(0, 0)).toBe(true);
      expect(board.isValidGuess(5, 5)).toBe(true);
      expect(board.isValidGuess(9, 9)).toBe(true);
    });

    test('should return false for out of bounds coordinates', () => {
      expect(board.isValidGuess(-1, 0)).toBe(false);
      expect(board.isValidGuess(0, -1)).toBe(false);
      expect(board.isValidGuess(10, 5)).toBe(false);
      expect(board.isValidGuess(5, 10)).toBe(false);
    });

    test('should return false for already guessed coordinates', () => {
      board.processGuess('55');
      expect(board.isValidGuess(5, 5)).toBe(false);
    });
  });

  describe('getAdjacentCoordinates', () => {
    test('should return all adjacent coordinates for center position', () => {
      const adjacent = board.getAdjacentCoordinates('55');
      expect(adjacent).toHaveLength(4);
      expect(adjacent).toContain('45'); // up
      expect(adjacent).toContain('65'); // down
      expect(adjacent).toContain('54'); // left
      expect(adjacent).toContain('56'); // right
    });

    test('should handle edge positions correctly', () => {
      const adjacent = board.getAdjacentCoordinates('00');
      expect(adjacent).toHaveLength(2);
      expect(adjacent).toContain('10'); // down
      expect(adjacent).toContain('01'); // right
    });

    test('should exclude already guessed coordinates', () => {
      board.processGuess('45');
      board.processGuess('56');
      
      const adjacent = board.getAdjacentCoordinates('55');
      expect(adjacent).toHaveLength(2);
      expect(adjacent).toContain('65'); // down
      expect(adjacent).toContain('54'); // left
      expect(adjacent).not.toContain('45'); // up (already guessed)
      expect(adjacent).not.toContain('56'); // right (already guessed)
    });
  });

  describe('getRemainingShips', () => {
    test('should return correct count of unsunk ships', () => {
      const ship1 = new Ship(3);
      const ship2 = new Ship(3);
      ship1.place(0, 0, 'horizontal');
      ship2.place(1, 0, 'horizontal');
      board.ships.push(ship1, ship2);

      expect(board.getRemainingShips()).toBe(2);

      // Sink first ship
      ship1.checkHit('00');
      ship1.checkHit('01');
      ship1.checkHit('02');

      expect(board.getRemainingShips()).toBe(1);

      // Sink second ship
      ship2.checkHit('10');
      ship2.checkHit('11');
      ship2.checkHit('12');

      expect(board.getRemainingShips()).toBe(0);
    });
  });

  describe('allShipsSunk', () => {
    test('should return false when ships remain', () => {
      const ship = new Ship(3);
      ship.place(0, 0, 'horizontal');
      board.ships.push(ship);

      expect(board.allShipsSunk()).toBe(false);

      // Partially hit ship
      ship.checkHit('00');
      expect(board.allShipsSunk()).toBe(false);
    });

    test('should return true when all ships are sunk', () => {
      const ship1 = new Ship(2);
      const ship2 = new Ship(2);
      ship1.place(0, 0, 'horizontal');
      ship2.place(1, 0, 'horizontal');
      board.ships.push(ship1, ship2);

      // Sink both ships
      ship1.checkHit('00');
      ship1.checkHit('01');
      ship2.checkHit('10');
      ship2.checkHit('11');

      expect(board.allShipsSunk()).toBe(true);
    });

    test('should return true for empty ship array', () => {
      expect(board.allShipsSunk()).toBe(true);
    });
  });

  describe('getGrid', () => {
    test('should return copy of grid', () => {
      const grid = board.getGrid();
      
      expect(grid).toHaveLength(10);
      expect(grid[0]).toHaveLength(10);
      
      // Verify it's a copy
      grid[0][0] = 'X';
      expect(board.grid[0][0]).toBe('~');
    });
  });

  describe('getAllShipLocations', () => {
    test('should return all ship locations', () => {
      const ship1 = new Ship(2);
      const ship2 = new Ship(2);
      ship1.place(0, 0, 'horizontal');
      ship2.place(1, 0, 'vertical');
      board.ships.push(ship1, ship2);

      const locations = board.getAllShipLocations();
      expect(locations).toHaveLength(4);
      expect(locations).toContain('00');
      expect(locations).toContain('01');
      expect(locations).toContain('10');
      expect(locations).toContain('20');
    });

    test('should return empty array for no ships', () => {
      expect(board.getAllShipLocations()).toEqual([]);
    });
  });

  describe('updateGridForShip', () => {
    test('should update grid with ship positions', () => {
      const ship = new Ship(3);
      ship.place(1, 1, 'horizontal');
      board.updateGridForShip(ship);

      expect(board.grid[1][1]).toBe('S');
      expect(board.grid[1][2]).toBe('S');
      expect(board.grid[1][3]).toBe('S');
      expect(board.grid[0][1]).toBe('~'); // Adjacent cell should remain water
    });
  });
}); 