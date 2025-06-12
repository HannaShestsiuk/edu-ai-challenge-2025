import { SeaBattleGame } from '../src/SeaBattleGame.js';
import { Player } from '../src/models/Player.js';
import { AIPlayer } from '../src/models/AIPlayer.js';
import { GameDisplay } from '../src/ui/GameDisplay.js';

// Mock readline to avoid issues during testing
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn()
  }))
}));

// Mock console methods to avoid cluttering test output
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe('SeaBattleGame', () => {
  let game;

  beforeEach(() => {
    game = new SeaBattleGame();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create game with default configuration', () => {
      expect(game.config.boardSize).toBe(10);
      expect(game.config.numShips).toBe(3);
      expect(game.config.shipLength).toBe(3);
      expect(game.player).toBeInstanceOf(Player);
      expect(game.aiPlayer).toBeInstanceOf(AIPlayer);
      expect(game.display).toBeInstanceOf(GameDisplay);
      expect(game.gameOver).toBe(false);
      expect(game.winner).toBeNull();
    });

    test('should create game with custom configuration', () => {
      const customGame = new SeaBattleGame({
        boardSize: 8,
        numShips: 2,
        shipLength: 4
      });

      expect(customGame.config.boardSize).toBe(8);
      expect(customGame.config.numShips).toBe(2);
      expect(customGame.config.shipLength).toBe(4);
    });

    test('should merge custom config with defaults', () => {
      const partialConfig = new SeaBattleGame({
        numShips: 5
      });

      expect(partialConfig.config.boardSize).toBe(10); // default
      expect(partialConfig.config.numShips).toBe(5); // custom
      expect(partialConfig.config.shipLength).toBe(3); // default
    });
  });

  describe('initializePlayers', () => {
    test('should initialize both players with ships', async () => {
      await game.initializePlayers();
      
      expect(game.player.board.ships).toHaveLength(3);
      expect(game.aiPlayer.board.ships).toHaveLength(3);
      
      // Check that ships are properly placed
      game.player.board.ships.forEach(ship => {
        expect(ship.locations).toHaveLength(3);
        expect(ship.length).toBe(3);
      });
      
      game.aiPlayer.board.ships.forEach(ship => {
        expect(ship.locations).toHaveLength(3);
        expect(ship.length).toBe(3);
      });
    });

    test('should handle initialization errors', async () => {
      // Mock player initialization to fail
      jest.spyOn(game.player, 'initialize').mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      await expect(game.initializePlayers()).rejects.toThrow('Initialization failed');
    });
  });

  describe('updateDisplay', () => {
    test('should update display with current game state', () => {
      jest.spyOn(game.display, 'showBoards');
      jest.spyOn(game.display, 'showGameStatus');
      
      // Create proper 10x10 grid mock data
      const mockGrid = Array(10).fill(null).map(() => Array(10).fill('~'));
      jest.spyOn(game.player.opponentBoard, 'getGrid').mockReturnValue(mockGrid);
      jest.spyOn(game.player.board, 'getGrid').mockReturnValue(mockGrid);
      jest.spyOn(game.player, 'getRemainingShips').mockReturnValue(3);
      jest.spyOn(game.aiPlayer, 'getRemainingShips').mockReturnValue(2);

      game.updateDisplay();

      expect(game.display.showBoards).toHaveBeenCalledWith(mockGrid, mockGrid);
      expect(game.display.showGameStatus).toHaveBeenCalledWith(3, 2);
    });
  });

  describe('handlePlayerTurn', () => {
    beforeEach(async () => {
      await game.initializePlayers();
      // Mock promptInput to return valid input
      game.promptInput = jest.fn().mockResolvedValue('55');
    });

    test('should process valid player guess', async () => {
      jest.spyOn(game.display, 'showPlayerGuessResult');
      jest.spyOn(game.aiPlayer, 'hasLost').mockReturnValue(false);
      // Mock to return miss to avoid infinite loop from hits
      jest.spyOn(game.aiPlayer, 'receiveGuess').mockReturnValue({ hit: false, sunk: false });

      const result = await game.handlePlayerTurn();

      expect(result).toBe(true);
      expect(game.display.showPlayerGuessResult).toHaveBeenCalled();
    });

    test('should handle invalid input', async () => {
      game.promptInput = jest.fn()
        .mockResolvedValueOnce('invalid') // First invalid input
        .mockResolvedValueOnce('55'); // Then valid input

      jest.spyOn(game.display, 'showInvalidInput');

      const result = await game.handlePlayerTurn();

      expect(game.display.showInvalidInput).toHaveBeenCalledWith('invalid');
      expect(result).toBe(true);
    });

    test('should handle already guessed location', async () => {
      // Mock consecutive inputs: first a miss, then the same location again
      game.promptInput = jest.fn()
        .mockResolvedValueOnce('55') // First guess (miss)
        .mockResolvedValueOnce('55') // Second guess (same location)
        .mockResolvedValueOnce('56'); // Third guess (different location, miss)
      
      // Mock to ensure we get misses to avoid infinite loop from hits
      jest.spyOn(game.aiPlayer, 'receiveGuess').mockReturnValue({ hit: false, sunk: false });

      // First guess
      const result1 = await game.handlePlayerTurn();
      expect(result1).toBe(true);
      
      // Second guess at same location should still work but show already guessed message
      const result2 = await game.handlePlayerTurn();
      expect(result2).toBe(true);
    });

    test('should detect game over when all AI ships sunk', async () => {
      jest.spyOn(game.aiPlayer, 'hasLost').mockReturnValue(true);
      // Mock to return miss to avoid infinite loop
      jest.spyOn(game.aiPlayer, 'receiveGuess').mockReturnValue({ hit: false, sunk: false });

      await game.handlePlayerTurn();

      expect(game.gameOver).toBe(true);
      expect(game.winner).toBe(game.player);
    });

    test('should continue player turn on hit and end on miss', async () => {
      // Mock inputs: hit, hit, miss
      game.promptInput = jest.fn()
        .mockResolvedValueOnce('55') // First guess (hit)
        .mockResolvedValueOnce('56') // Second guess (hit) 
        .mockResolvedValueOnce('57'); // Third guess (miss)
      
      // Mock to return hit, then hit, then miss
      jest.spyOn(game.aiPlayer, 'receiveGuess')
        .mockReturnValueOnce({ hit: true, sunk: false })
        .mockReturnValueOnce({ hit: true, sunk: false })
        .mockReturnValueOnce({ hit: false, sunk: false });
      
      jest.spyOn(game.aiPlayer, 'hasLost').mockReturnValue(false);
      jest.spyOn(game.display, 'showPlayerGuessResult');

      const result = await game.handlePlayerTurn();

      expect(result).toBe(true);
      // Should have been called 3 times (2 hits + 1 miss)
      expect(game.display.showPlayerGuessResult).toHaveBeenCalledTimes(3);
    });
  });

  describe('handleCPUTurn', () => {
    beforeEach(async () => {
      await game.initializePlayers();
    });

    test('should process CPU turn', async () => {
      jest.spyOn(game.aiPlayer, 'makeGuess').mockReturnValue('33');
      jest.spyOn(game.aiPlayer, 'getMode').mockReturnValue('hunt');
      jest.spyOn(game.display, 'showCPUTurn');
      jest.spyOn(game.display, 'showCPUGuessResult');
      jest.spyOn(game.player, 'hasLost').mockReturnValue(false);

      await game.handleCPUTurn();

      expect(game.display.showCPUTurn).toHaveBeenCalledWith('33', 'hunt');
      expect(game.display.showCPUGuessResult).toHaveBeenCalled();
    });

    test('should detect game over when all player ships sunk', async () => {
      jest.spyOn(game.aiPlayer, 'makeGuess').mockReturnValue('33');
      jest.spyOn(game.player, 'hasLost').mockReturnValue(true);

      await game.handleCPUTurn();

      expect(game.gameOver).toBe(true);
      expect(game.winner).toBe(game.aiPlayer);
    });

    test('should update AI strategy based on result', async () => {
      jest.spyOn(game.aiPlayer, 'makeGuess').mockReturnValue('33');
      jest.spyOn(game.aiPlayer, 'processGuessResult');

      await game.handleCPUTurn();

      expect(game.aiPlayer.processGuessResult).toHaveBeenCalled();
    });
  });

  describe('endGame', () => {
    test('should display game over screen for player win', () => {
      game.winner = game.player;
      jest.spyOn(game.display, 'showGameOver');
      
      // Create proper 10x10 grid mock data
      const mockGrid = Array(10).fill(null).map(() => Array(10).fill('~'));
      jest.spyOn(game.aiPlayer.board, 'getGrid').mockReturnValue(mockGrid);
      jest.spyOn(game.player.board, 'getGrid').mockReturnValue(mockGrid);

      game.endGame();

      expect(game.display.showGameOver).toHaveBeenCalledWith(true, mockGrid, mockGrid);
    });

    test('should display game over screen for AI win', () => {
      game.winner = game.aiPlayer;
      jest.spyOn(game.display, 'showGameOver');
      
      // Create proper 10x10 grid mock data
      const mockGrid = Array(10).fill(null).map(() => Array(10).fill('~'));
      jest.spyOn(game.aiPlayer.board, 'getGrid').mockReturnValue(mockGrid);
      jest.spyOn(game.player.board, 'getGrid').mockReturnValue(mockGrid);

      game.endGame();

      expect(game.display.showGameOver).toHaveBeenCalledWith(false, mockGrid, mockGrid);
    });
  });

  describe('getGameStats', () => {
    test('should return current game statistics', () => {
      jest.spyOn(game.player, 'getRemainingShips').mockReturnValue(2);
      jest.spyOn(game.aiPlayer, 'getRemainingShips').mockReturnValue(1);
      jest.spyOn(game.aiPlayer, 'getMode').mockReturnValue('target');
      
      game.player.opponentBoard.guesses.add('55');
      game.player.opponentBoard.guesses.add('56');
      game.aiPlayer.board.guesses.add('33');

      const stats = game.getGameStats();

      expect(stats).toEqual({
        playerShips: 2,
        cpuShips: 1,
        playerGuesses: 2,
        cpuGuesses: 1,
        cpuMode: 'target',
        gameOver: false,
        winner: null
      });
    });

    test('should include winner when game is over', () => {
      game.gameOver = true;
      game.winner = game.player;

      const stats = game.getGameStats();

      expect(stats.gameOver).toBe(true);
      expect(stats.winner).toBe('Player');
    });
  });

  describe('reset', () => {
    test('should reset game to initial state', () => {
      // Simulate game in progress
      game.gameOver = true;
      game.winner = game.player;

      game.reset();

      expect(game.player).toBeInstanceOf(Player);
      expect(game.aiPlayer).toBeInstanceOf(AIPlayer);
      expect(game.gameOver).toBe(false);
      expect(game.winner).toBeNull();
    });
  });

  describe('promptInput', () => {
    test('should return trimmed user input', async () => {
      const mockQuestion = jest.fn((question, callback) => {
        callback('  55  ');
      });
      game.rl.question = mockQuestion;

      const result = await game.promptInput('Test question: ');

      expect(result).toBe('55');
      expect(mockQuestion).toHaveBeenCalledWith('Test question: ', expect.any(Function));
    });
  });

  describe('integration scenarios', () => {
    test('should handle complete game flow', async () => {
      jest.spyOn(game.display, 'showWelcome');
      jest.spyOn(game.display, 'showInitialization');
      
      // Mock successful initialization
      await game.initializePlayers();

      expect(game.player.board.ships).toHaveLength(3);
      expect(game.aiPlayer.board.ships).toHaveLength(3);
      expect(game.gameOver).toBe(false);
    });

    test('should handle game with custom configuration', async () => {
      const customGame = new SeaBattleGame({
        numShips: 2,
        shipLength: 2
      });

      await customGame.initializePlayers();

      expect(customGame.player.board.ships).toHaveLength(2);
      expect(customGame.aiPlayer.board.ships).toHaveLength(2);
      
      customGame.player.board.ships.forEach(ship => {
        expect(ship.length).toBe(2);
      });
    });

    test('should maintain game state consistency', async () => {
      await game.initializePlayers();

      const initialPlayerShips = game.player.getRemainingShips();
      const initialAIShips = game.aiPlayer.getRemainingShips();

      expect(initialPlayerShips).toBe(3);
      expect(initialAIShips).toBe(3);

      // Simulate a hit on player
      const playerShip = game.player.board.ships[0];
      const hitCoordinate = playerShip.locations[0];
      game.player.receiveGuess(hitCoordinate);

      // Ship count should remain same until fully sunk
      expect(game.player.getRemainingShips()).toBe(3);

      // Sink the ship completely
      playerShip.locations.forEach(location => {
        game.player.receiveGuess(location);
      });

      expect(game.player.getRemainingShips()).toBe(2);
    });
  });

  describe('error handling', () => {
    test('should handle display errors gracefully', () => {
      jest.spyOn(game.display, 'showBoards').mockImplementation(() => {
        throw new Error('Display error');
      });

      expect(() => game.updateDisplay()).toThrow('Display error');
    });

    test('should handle player initialization failure', async () => {
      jest.spyOn(game.player, 'initialize').mockImplementation(() => {
        throw new Error('Failed to place ships');
      });

      await expect(game.initializePlayers()).rejects.toThrow('Failed to place ships');
    });
  });
});
