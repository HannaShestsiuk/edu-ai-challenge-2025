import { AIPlayer } from '../../src/models/AIPlayer.js';
import { Board } from '../../src/models/Board.js';
import { Ship } from '../../src/models/Ship.js';

describe('AIPlayer', () => {
  let aiPlayer;
  let opponentBoard;

  beforeEach(() => {
    aiPlayer = new AIPlayer('TestCPU');
    opponentBoard = new Board(10);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create AI player with default name', () => {
      const defaultAI = new AIPlayer();
      expect(defaultAI.name).toBe('CPU');
      expect(defaultAI.mode).toBe('hunt');
      expect(defaultAI.targetQueue).toEqual([]);
      expect(defaultAI.lastHit).toBeNull();
    });

    test('should create AI player with custom name', () => {
      expect(aiPlayer.name).toBe('TestCPU');
      expect(aiPlayer.mode).toBe('hunt');
      expect(aiPlayer.targetQueue).toEqual([]);
      expect(aiPlayer.lastHit).toBeNull();
    });

    test('should inherit from Player', () => {
      expect(aiPlayer.board).toBeInstanceOf(Board);
      expect(aiPlayer.opponentBoard).toBeInstanceOf(Board);
    });
  });

  describe('generateHuntGuess', () => {
    test('should generate valid coordinate', () => {
      const coordinate = aiPlayer.generateHuntGuess(opponentBoard);
      expect(coordinate).toMatch(/^[0-9][0-9]$/);
      
      const row = parseInt(coordinate[0]);
      const col = parseInt(coordinate[1]);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(10);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(10);
    });

    test('should avoid already guessed coordinates', () => {
      // Mark some coordinates as already guessed
      opponentBoard.processGuess('00');
      opponentBoard.processGuess('01');
      opponentBoard.processGuess('02');
      
      const coordinate = aiPlayer.generateHuntGuess(opponentBoard);
      expect(coordinate).not.toBe('00');
      expect(coordinate).not.toBe('01');
      expect(coordinate).not.toBe('02');
    });

    test('should throw error when no valid guesses available', () => {
      // Fill entire board
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          opponentBoard.processGuess(`${i}${j}`);
        }
      }

      expect(() => aiPlayer.generateHuntGuess(opponentBoard)).toThrow('No valid guesses available');
    });
  });

  describe('makeGuess', () => {
    test('should use hunt mode when in hunt mode', () => {
      const coordinate = aiPlayer.makeGuess(opponentBoard);
      expect(coordinate).toMatch(/^[0-9][0-9]$/);
      expect(aiPlayer.mode).toBe('hunt');
    });

    test('should use target queue when in target mode', () => {
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = ['45', '46', '47'];

      const coordinate = aiPlayer.makeGuess(opponentBoard);
      expect(coordinate).toBe('45');
      expect(aiPlayer.targetQueue).toEqual(['46', '47']);
    });

    test('should switch to hunt mode when target queue is empty', () => {
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = [];

      const coordinate = aiPlayer.makeGuess(opponentBoard);
      expect(coordinate).toMatch(/^[0-9][0-9]$/);
      expect(aiPlayer.mode).toBe('hunt');
    });
  });

  describe('addAdjacentTargets', () => {
    test('should add all valid adjacent coordinates', () => {
      aiPlayer.addAdjacentTargets('55', opponentBoard);
      
      expect(aiPlayer.targetQueue).toHaveLength(4);
      expect(aiPlayer.targetQueue).toContain('45'); // up
      expect(aiPlayer.targetQueue).toContain('65'); // down
      expect(aiPlayer.targetQueue).toContain('54'); // left
      expect(aiPlayer.targetQueue).toContain('56'); // right
    });

    test('should handle edge coordinates', () => {
      aiPlayer.addAdjacentTargets('00', opponentBoard);
      
      expect(aiPlayer.targetQueue).toHaveLength(2);
      expect(aiPlayer.targetQueue).toContain('10'); // down
      expect(aiPlayer.targetQueue).toContain('01'); // right
    });

    test('should exclude already guessed coordinates', () => {
      opponentBoard.processGuess('45');
      opponentBoard.processGuess('56');
      
      aiPlayer.addAdjacentTargets('55', opponentBoard);
      
      expect(aiPlayer.targetQueue).toHaveLength(2);
      expect(aiPlayer.targetQueue).toContain('65'); // down
      expect(aiPlayer.targetQueue).toContain('54'); // left
      expect(aiPlayer.targetQueue).not.toContain('45'); // up (already guessed)
      expect(aiPlayer.targetQueue).not.toContain('56'); // right (already guessed)
    });

    test('should not add duplicates to target queue', () => {
      aiPlayer.targetQueue = ['54'];
      aiPlayer.addAdjacentTargets('55', opponentBoard);
      
      // Should not have duplicate '54'
      const count54 = aiPlayer.targetQueue.filter(coord => coord === '54').length;
      expect(count54).toBe(1);
    });
  });

  describe('processGuessResult', () => {
    beforeEach(() => {
      // Place a ship for testing
      const ship = new Ship(3);
      ship.place(5, 5, 'horizontal'); // positions: 55, 56, 57
      opponentBoard.ships.push(ship);
    });

    test('should switch to target mode on hit', () => {
      const result = { hit: true, sunk: false };
      aiPlayer.processGuessResult('55', result, opponentBoard);
      
      expect(aiPlayer.mode).toBe('target');
      expect(aiPlayer.lastHit).toBe('55');
      expect(aiPlayer.targetQueue).toHaveLength(4); // 4 adjacent coordinates
    });

    test('should return to hunt mode when ship is sunk', () => {
      const result = { hit: true, sunk: true };
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = ['56', '57'];
      aiPlayer.lastHit = '55';
      
      aiPlayer.processGuessResult('55', result, opponentBoard);
      
      expect(aiPlayer.mode).toBe('hunt');
      expect(aiPlayer.targetQueue).toEqual([]);
      expect(aiPlayer.lastHit).toBeNull();
    });

    test('should remain in target mode on miss with targets remaining', () => {
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = ['56', '57'];
      
      const result = { hit: false, sunk: false };
      aiPlayer.processGuessResult('54', result, opponentBoard);
      
      expect(aiPlayer.mode).toBe('target');
      expect(aiPlayer.targetQueue).toEqual(['56', '57']);
    });

    test('should return to hunt mode on miss with no targets remaining', () => {
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = [];
      aiPlayer.lastHit = '55';
      
      const result = { hit: false, sunk: false };
      aiPlayer.processGuessResult('54', result, opponentBoard);
      
      expect(aiPlayer.mode).toBe('hunt');
      expect(aiPlayer.lastHit).toBeNull();
    });
  });

  describe('getMode', () => {
    test('should return current mode', () => {
      expect(aiPlayer.getMode()).toBe('hunt');
      
      aiPlayer.mode = 'target';
      expect(aiPlayer.getMode()).toBe('target');
    });
  });

  describe('getTargetQueue', () => {
    test('should return copy of target queue', () => {
      aiPlayer.targetQueue = ['55', '56', '57'];
      const queue = aiPlayer.getTargetQueue();
      
      expect(queue).toEqual(['55', '56', '57']);
      
      // Verify it's a copy
      queue.push('58');
      expect(aiPlayer.targetQueue).toEqual(['55', '56', '57']);
    });
  });

  describe('resetStrategy', () => {
    test('should reset AI strategy to initial state', () => {
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = ['55', '56'];
      aiPlayer.lastHit = '54';
      
      aiPlayer.resetStrategy();
      
      expect(aiPlayer.mode).toBe('hunt');
      expect(aiPlayer.targetQueue).toEqual([]);
      expect(aiPlayer.lastHit).toBeNull();
    });
  });

  describe('integration with board', () => {
    test('should complete hunt-target cycle', () => {
      const targetBoard = new Board(10);
      const ship = new Ship(2);
      ship.place(5, 5, 'horizontal'); // positions: 55, 56
      targetBoard.ships.push(ship);

      // Start in hunt mode
      expect(aiPlayer.getMode()).toBe('hunt');

      // Simulate finding and sinking a ship
      let coordinate = '55'; // Assume hunt found this
      let result = targetBoard.processGuess(coordinate);
      aiPlayer.processGuessResult(coordinate, result, targetBoard);

      // Should now be in target mode
      expect(aiPlayer.getMode()).toBe('target');
      expect(aiPlayer.getTargetQueue().length).toBeGreaterThan(0);

      // Continue until ship is sunk
      while (aiPlayer.getMode() === 'target' && aiPlayer.getTargetQueue().length > 0) {
        coordinate = aiPlayer.makeGuess(targetBoard);
        result = targetBoard.processGuess(coordinate);
        aiPlayer.processGuessResult(coordinate, result, targetBoard);
      }

      // Should return to hunt mode after sinking ship
      expect(aiPlayer.getMode()).toBe('hunt');
    });
  });
}); 