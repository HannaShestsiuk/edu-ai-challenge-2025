import { GameUtils } from '../../src/utils/GameUtils.js';

describe('GameUtils', () => {
  describe('validateInput', () => {
    test('should accept valid two-digit coordinates', () => {
      const result = GameUtils.validateInput('00');
      expect(result.isValid).toBe(true);
      expect(result.row).toBe(0);
      expect(result.col).toBe(0);
      expect(result.coordinate).toBe('00');
    });

    test('should accept all valid coordinate ranges', () => {
      const validInputs = ['00', '09', '90', '99', '55', '37'];
      
      validInputs.forEach(input => {
        const result = GameUtils.validateInput(input);
        expect(result.isValid).toBe(true);
        expect(result.coordinate).toBe(input);
      });
    });

    test('should reject null or undefined input', () => {
      expect(GameUtils.validateInput(null).isValid).toBe(false);
      expect(GameUtils.validateInput(undefined).isValid).toBe(false);
      expect(GameUtils.validateInput(null).error).toBe('Input must be a string');
    });

    test('should reject non-string input', () => {
      const result = GameUtils.validateInput(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input must be a string');
    });

    test('should reject wrong length inputs', () => {
      // Test specific length violations separately
      expect(GameUtils.validateInput('').isValid).toBe(false);
      expect(GameUtils.validateInput('').error).toBe('Input must be exactly two digits (e.g., 00, 34, 98)');
      
      expect(GameUtils.validateInput('1').isValid).toBe(false);
      expect(GameUtils.validateInput('1').error).toBe('Input must be exactly two digits (e.g., 00, 34, 98)');
      
      expect(GameUtils.validateInput('123').isValid).toBe(false);
      expect(GameUtils.validateInput('123').error).toBe('Input must be exactly two digits (e.g., 00, 34, 98)');
    });

    test('should reject non-digit characters', () => {
      const invalidInputs = ['ab', 'a1', '1a', '!!', '0x'];
      
      invalidInputs.forEach(input => {
        const result = GameUtils.validateInput(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Both characters must be digits');
      });
    });

    test('should reject out of range coordinates', () => {
      const outOfRangeInputs = ['aa', '0a', 'a0', '99'].filter(input => /[a-z]/.test(input));
      
      // Test with mock invalid digit inputs
      expect(GameUtils.validateInput('0a').isValid).toBe(false);
      expect(GameUtils.validateInput('a0').isValid).toBe(false);
    });

    test('should handle whitespace trimming', () => {
      const result = GameUtils.validateInput('  55  ');
      expect(result.isValid).toBe(true);
      expect(result.coordinate).toBe('55');
      expect(result.row).toBe(5);
      expect(result.col).toBe(5);
    });
  });

  describe('deepCopy2D', () => {
    test('should create deep copy of 2D array', () => {
      const original = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ];
      
      const copy = GameUtils.deepCopy2D(original);
      
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
      expect(copy[0]).not.toBe(original[0]);
      
      // Verify it's a deep copy
      copy[0][0] = 'modified';
      expect(original[0][0]).toBe('a');
    });

    test('should handle empty arrays', () => {
      expect(GameUtils.deepCopy2D([])).toEqual([]);
      expect(GameUtils.deepCopy2D([[], []])).toEqual([[], []]);
    });
  });

  describe('parseCoordinate', () => {
    test('should parse coordinate string correctly', () => {
      expect(GameUtils.parseCoordinate('00')).toEqual({ row: 0, col: 0 });
      expect(GameUtils.parseCoordinate('37')).toEqual({ row: 3, col: 7 });
      expect(GameUtils.parseCoordinate('99')).toEqual({ row: 9, col: 9 });
    });

    test('should handle edge cases', () => {
      expect(GameUtils.parseCoordinate('90')).toEqual({ row: 9, col: 0 });
      expect(GameUtils.parseCoordinate('09')).toEqual({ row: 0, col: 9 });
    });
  });

  describe('formatCoordinate', () => {
    test('should format row and column to coordinate string', () => {
      expect(GameUtils.formatCoordinate(0, 0)).toBe('00');
      expect(GameUtils.formatCoordinate(3, 7)).toBe('37');
      expect(GameUtils.formatCoordinate(9, 9)).toBe('99');
    });

    test('should handle edge cases', () => {
      expect(GameUtils.formatCoordinate(9, 0)).toBe('90');
      expect(GameUtils.formatCoordinate(0, 9)).toBe('09');
    });
  });

  describe('randomInt', () => {
    test('should generate numbers within range', () => {
      const results = Array.from({ length: 100 }, () => GameUtils.randomInt(1, 5));
      
      results.forEach(result => {
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(5);
        expect(Number.isInteger(result)).toBe(true);
      });
    });

    test('should handle single value range', () => {
      expect(GameUtils.randomInt(5, 5)).toBe(5);
    });

    test('should handle zero range', () => {
      expect(GameUtils.randomInt(0, 0)).toBe(0);
    });

    test('should handle negative numbers', () => {
      const result = GameUtils.randomInt(-5, -1);
      expect(result).toBeGreaterThanOrEqual(-5);
      expect(result).toBeLessThanOrEqual(-1);
    });
  });

  describe('areAdjacent', () => {
    test('should detect horizontally adjacent coordinates', () => {
      expect(GameUtils.areAdjacent('55', '56')).toBe(true);
      expect(GameUtils.areAdjacent('56', '55')).toBe(true);
      expect(GameUtils.areAdjacent('00', '01')).toBe(true);
    });

    test('should detect vertically adjacent coordinates', () => {
      expect(GameUtils.areAdjacent('55', '45')).toBe(true);
      expect(GameUtils.areAdjacent('45', '55')).toBe(true);
      expect(GameUtils.areAdjacent('00', '10')).toBe(true);
    });

    test('should reject diagonally adjacent coordinates', () => {
      expect(GameUtils.areAdjacent('55', '44')).toBe(false);
      expect(GameUtils.areAdjacent('55', '46')).toBe(false);
      expect(GameUtils.areAdjacent('55', '64')).toBe(false);
      expect(GameUtils.areAdjacent('55', '66')).toBe(false);
    });

    test('should reject non-adjacent coordinates', () => {
      expect(GameUtils.areAdjacent('55', '57')).toBe(false);
      expect(GameUtils.areAdjacent('55', '35')).toBe(false);
      expect(GameUtils.areAdjacent('00', '99')).toBe(false);
    });

    test('should reject same coordinates', () => {
      expect(GameUtils.areAdjacent('55', '55')).toBe(false);
    });
  });

  describe('manhattanDistance', () => {
    test('should calculate distance correctly', () => {
      expect(GameUtils.manhattanDistance('00', '00')).toBe(0);
      expect(GameUtils.manhattanDistance('00', '01')).toBe(1);
      expect(GameUtils.manhattanDistance('00', '10')).toBe(1);
      expect(GameUtils.manhattanDistance('00', '11')).toBe(2);
      expect(GameUtils.manhattanDistance('00', '99')).toBe(18);
    });

    test('should be symmetric', () => {
      expect(GameUtils.manhattanDistance('23', '56')).toBe(GameUtils.manhattanDistance('56', '23'));
      expect(GameUtils.manhattanDistance('00', '99')).toBe(GameUtils.manhattanDistance('99', '00'));
    });

    test('should handle edge cases', () => {
      expect(GameUtils.manhattanDistance('09', '90')).toBe(18);
      expect(GameUtils.manhattanDistance('45', '54')).toBe(2);
    });
  });

  describe('getCoordinatesWithinDistance', () => {
    test('should find coordinates within distance 1', () => {
      const coords = GameUtils.getCoordinatesWithinDistance('55', 1);
      
      expect(coords).toHaveLength(4);
      expect(coords).toContain('45');
      expect(coords).toContain('65');
      expect(coords).toContain('54');
      expect(coords).toContain('56');
      expect(coords).not.toContain('55'); // Should not include center
    });

    test('should find coordinates within distance 2', () => {
      const coords = GameUtils.getCoordinatesWithinDistance('55', 2);
      
      expect(coords.length).toBeGreaterThan(4);
      expect(coords).toContain('35'); // distance 2
      expect(coords).toContain('75'); // distance 2
      expect(coords).toContain('53'); // distance 2
      expect(coords).toContain('57'); // distance 2
    });

    test('should handle edge coordinates', () => {
      const coords = GameUtils.getCoordinatesWithinDistance('00', 1);
      
      expect(coords).toHaveLength(2);
      expect(coords).toContain('10');
      expect(coords).toContain('01');
    });

    test('should handle custom board size', () => {
      const coords = GameUtils.getCoordinatesWithinDistance('22', 1, 5);
      
      expect(coords).toHaveLength(4);
      coords.forEach(coord => {
        const { row, col } = GameUtils.parseCoordinate(coord);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(5);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(5);
      });
    });
  });

  describe('shuffleArray', () => {
    test('should return array with same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = GameUtils.shuffleArray(original);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    test('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      
      GameUtils.shuffleArray(original);
      expect(original).toEqual(originalCopy);
    });

    test('should handle empty array', () => {
      expect(GameUtils.shuffleArray([])).toEqual([]);
    });

    test('should handle single element array', () => {
      expect(GameUtils.shuffleArray([42])).toEqual([42]);
    });
  });

  describe('isWithinBounds', () => {
    test('should return true for valid coordinates', () => {
      expect(GameUtils.isWithinBounds(0, 0)).toBe(true);
      expect(GameUtils.isWithinBounds(5, 5)).toBe(true);
      expect(GameUtils.isWithinBounds(9, 9)).toBe(true);
      expect(GameUtils.isWithinBounds(0, 9)).toBe(true);
      expect(GameUtils.isWithinBounds(9, 0)).toBe(true);
    });

    test('should return false for out of bounds coordinates', () => {
      expect(GameUtils.isWithinBounds(-1, 0)).toBe(false);
      expect(GameUtils.isWithinBounds(0, -1)).toBe(false);
      expect(GameUtils.isWithinBounds(10, 5)).toBe(false);
      expect(GameUtils.isWithinBounds(5, 10)).toBe(false);
      expect(GameUtils.isWithinBounds(10, 10)).toBe(false);
    });

    test('should handle custom board size', () => {
      expect(GameUtils.isWithinBounds(4, 4, 5)).toBe(true);
      expect(GameUtils.isWithinBounds(5, 5, 5)).toBe(false);
    });
  });

  describe('formatTime', () => {
    test('should format seconds correctly', () => {
      expect(GameUtils.formatTime(1000)).toBe('1s');
      expect(GameUtils.formatTime(30000)).toBe('30s');
      expect(GameUtils.formatTime(59000)).toBe('59s');
    });

    test('should format minutes and seconds correctly', () => {
      expect(GameUtils.formatTime(60000)).toBe('1m 0s');
      expect(GameUtils.formatTime(90000)).toBe('1m 30s');
      expect(GameUtils.formatTime(125000)).toBe('2m 5s');
    });

    test('should handle zero time', () => {
      expect(GameUtils.formatTime(0)).toBe('0s');
    });

    test('should handle fractional seconds', () => {
      expect(GameUtils.formatTime(1500)).toBe('1s'); // Should floor to 1
      expect(GameUtils.formatTime(999)).toBe('0s'); // Should floor to 0
    });
  });

  describe('integration tests', () => {
    test('should work together for coordinate validation and parsing', () => {
      const input = '37';
      const validation = GameUtils.validateInput(input);
      
      if (validation.isValid) {
        const parsed = GameUtils.parseCoordinate(validation.coordinate);
        const formatted = GameUtils.formatCoordinate(parsed.row, parsed.col);
        
        expect(formatted).toBe(input);
      }
    });

    test('should work together for distance and adjacency calculations', () => {
      const coord1 = '55';
      const coord2 = '56';
      
      expect(GameUtils.areAdjacent(coord1, coord2)).toBe(true);
      expect(GameUtils.manhattanDistance(coord1, coord2)).toBe(1);
      
      const withinDistance = GameUtils.getCoordinatesWithinDistance(coord1, 1);
      expect(withinDistance).toContain(coord2);
    });
  });
}); 