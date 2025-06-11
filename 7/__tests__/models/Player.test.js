import { Player } from '../../src/models/Player.js';
import { Board } from '../../src/models/Board.js';

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player('TestPlayer');
  });

  describe('constructor', () => {
    test('should create player with default name', () => {
      const defaultPlayer = new Player();
      expect(defaultPlayer.name).toBe('Player');
      expect(defaultPlayer.board).toBeInstanceOf(Board);
      expect(defaultPlayer.opponentBoard).toBeInstanceOf(Board);
    });

    test('should create player with custom name', () => {
      expect(player.name).toBe('TestPlayer');
      expect(player.board).toBeInstanceOf(Board);
      expect(player.opponentBoard).toBeInstanceOf(Board);
    });

    test('should have separate board instances', () => {
      expect(player.board).not.toBe(player.opponentBoard);
    });
  });

  describe('initialize', () => {
    test('should place ships with default parameters', () => {
      player.initialize();
      
      expect(player.board.ships).toHaveLength(3);
      expect(player.board.ships[0].length).toBe(3);
    });

    test('should place ships with custom parameters', () => {
      player.initialize(2, 4);
      
      expect(player.board.ships).toHaveLength(2);
      expect(player.board.ships[0].length).toBe(4);
      expect(player.board.ships[1].length).toBe(4);
    });

    test('should throw error if ship placement fails', () => {
      // Mock board to always return null for ship placement
      jest.spyOn(player.board, 'placeShipRandomly').mockReturnValue(null);
      
      expect(() => player.initialize(1, 3)).toThrow('Failed to place ship 1 for TestPlayer');
    });

    test('should update grid with placed ships', () => {
      player.initialize(1, 3);
      
      // Check that at least some grid positions have ships
      let hasShips = false;
      for (let i = 0; i < player.board.size; i++) {
        for (let j = 0; j < player.board.size; j++) {
          if (player.board.grid[i][j] === 'S') {
            hasShips = true;
            break;
          }
        }
        if (hasShips) break;
      }
      expect(hasShips).toBe(true);
    });
  });

  describe('makeGuess', () => {
    test('should throw error when not implemented', () => {
      expect(() => player.makeGuess('00')).toThrow('makeGuess method must be implemented');
    });
  });

  describe('receiveGuess', () => {
    beforeEach(() => {
      player.initialize(1, 3);
    });

    test('should process guess on player board', () => {
      const ship = player.board.ships[0];
      const hitLocation = ship.locations[0];
      
      const result = player.receiveGuess(hitLocation);
      
      expect(result.hit).toBe(true);
      expect(result.ship).toBe(ship);
      expect(player.board.guesses.has(hitLocation)).toBe(true);
    });

    test('should handle miss', () => {
      const result = player.receiveGuess('99'); // Likely empty position
      
      if (!result.hit) {
        expect(result.hit).toBe(false);
        expect(result.sunk).toBe(false);
        expect(player.board.guesses.has('99')).toBe(true);
      }
    });

    test('should handle already guessed location', () => {
      player.receiveGuess('99');
      const result = player.receiveGuess('99');
      
      expect(result.alreadyGuessed).toBe(true);
    });
  });

  describe('hasLost', () => {
    test('should return false when ships remain', () => {
      player.initialize(2, 2);
      expect(player.hasLost()).toBe(false);
    });

    test('should return false when ships are partially damaged', () => {
      player.initialize(1, 2);
      const ship = player.board.ships[0];
      ship.checkHit(ship.locations[0]); // Hit but not sunk
      
      expect(player.hasLost()).toBe(false);
    });

    test('should return true when all ships are sunk', () => {
      player.initialize(1, 2);
      const ship = player.board.ships[0];
      
      // Sink the ship
      ship.checkHit(ship.locations[0]);
      ship.checkHit(ship.locations[1]);
      
      expect(player.hasLost()).toBe(true);
    });

    test('should return true for player with no ships', () => {
      expect(player.hasLost()).toBe(true);
    });
  });

  describe('getBoard', () => {
    test('should return player board', () => {
      const board = player.getBoard();
      expect(board).toBe(player.board);
      expect(board).toBeInstanceOf(Board);
    });
  });

  describe('getOpponentBoard', () => {
    test('should return opponent board', () => {
      const opponentBoard = player.getOpponentBoard();
      expect(opponentBoard).toBe(player.opponentBoard);
      expect(opponentBoard).toBeInstanceOf(Board);
    });
  });

  describe('getRemainingShips', () => {
    test('should return correct count of remaining ships', () => {
      player.initialize(3, 2);
      expect(player.getRemainingShips()).toBe(3);
      
      // Sink one ship
      const ship = player.board.ships[0];
      ship.checkHit(ship.locations[0]);
      ship.checkHit(ship.locations[1]);
      
      expect(player.getRemainingShips()).toBe(2);
    });

    test('should return 0 when no ships remain', () => {
      player.initialize(1, 1);
      const ship = player.board.ships[0];
      ship.checkHit(ship.locations[0]);
      
      expect(player.getRemainingShips()).toBe(0);
    });

    test('should return 0 for uninitialized player', () => {
      expect(player.getRemainingShips()).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    test('should handle complete game scenario', () => {
      // Initialize player with ships
      player.initialize(2, 2);
      expect(player.getRemainingShips()).toBe(2);
      expect(player.hasLost()).toBe(false);
      
      // Simulate hits on first ship
      const ship1 = player.board.ships[0];
      let result = player.receiveGuess(ship1.locations[0]);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      
      result = player.receiveGuess(ship1.locations[1]);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(player.getRemainingShips()).toBe(1);
      
      // Simulate hits on second ship
      const ship2 = player.board.ships[1];
      player.receiveGuess(ship2.locations[0]);
      result = player.receiveGuess(ship2.locations[1]);
      expect(result.sunk).toBe(true);
      
      expect(player.getRemainingShips()).toBe(0);
      expect(player.hasLost()).toBe(true);
    });
  });
}); 