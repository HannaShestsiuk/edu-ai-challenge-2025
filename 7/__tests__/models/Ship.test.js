import { Ship } from '../../src/models/Ship.js';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3);
  });

  describe('constructor', () => {
    test('should create ship with default length 3', () => {
      const defaultShip = new Ship();
      expect(defaultShip.length).toBe(3);
      expect(defaultShip.locations).toEqual([]);
      expect(defaultShip.hits).toEqual([false, false, false]);
      expect(defaultShip.orientation).toBeNull();
      expect(defaultShip.startRow).toBeNull();
      expect(defaultShip.startCol).toBeNull();
    });

    test('should create ship with custom length', () => {
      const customShip = new Ship(5);
      expect(customShip.length).toBe(5);
      expect(customShip.hits).toEqual([false, false, false, false, false]);
    });
  });

  describe('place', () => {
    test('should place ship horizontally', () => {
      ship.place(2, 3, 'horizontal');
      
      expect(ship.startRow).toBe(2);
      expect(ship.startCol).toBe(3);
      expect(ship.orientation).toBe('horizontal');
      expect(ship.locations).toEqual(['23', '24', '25']);
    });

    test('should place ship vertically', () => {
      ship.place(1, 4, 'vertical');
      
      expect(ship.startRow).toBe(1);
      expect(ship.startCol).toBe(4);
      expect(ship.orientation).toBe('vertical');
      expect(ship.locations).toEqual(['14', '24', '34']);
    });

    test('should handle edge placements', () => {
      ship.place(0, 0, 'horizontal');
      expect(ship.locations).toEqual(['00', '01', '02']);
      
      ship.place(0, 0, 'vertical');
      expect(ship.locations).toEqual(['00', '10', '20']);
    });
  });

  describe('checkHit', () => {
    beforeEach(() => {
      ship.place(2, 3, 'horizontal');
    });

    test('should return true for valid hit', () => {
      const result = ship.checkHit('23');
      expect(result).toBe(true);
      expect(ship.hits[0]).toBe(true);
    });

    test('should return false for miss', () => {
      const result = ship.checkHit('22');
      expect(result).toBe(false);
      expect(ship.hits).toEqual([false, false, false]);
    });

    test('should return false for already hit location', () => {
      ship.checkHit('23'); // First hit
      const result = ship.checkHit('23'); // Second hit on same location
      expect(result).toBe(false);
      expect(ship.hits[0]).toBe(true);
    });

    test('should handle multiple hits correctly', () => {
      expect(ship.checkHit('23')).toBe(true);
      expect(ship.checkHit('24')).toBe(true);
      expect(ship.checkHit('25')).toBe(true);
      expect(ship.hits).toEqual([true, true, true]);
    });
  });

  describe('isSunk', () => {
    beforeEach(() => {
      ship.place(2, 3, 'horizontal');
    });

    test('should return false when ship is not hit', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false when ship is partially hit', () => {
      ship.checkHit('23');
      ship.checkHit('24');
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when ship is completely sunk', () => {
      ship.checkHit('23');
      ship.checkHit('24');
      ship.checkHit('25');
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe('getLocations', () => {
    test('should return copy of locations array', () => {
      ship.place(1, 1, 'horizontal');
      const locations = ship.getLocations();
      
      expect(locations).toEqual(['11', '12', '13']);
      
      // Verify it's a copy by modifying the returned array
      locations.push('14');
      expect(ship.locations).toEqual(['11', '12', '13']); // Original unchanged
    });

    test('should return empty array for unplaced ship', () => {
      expect(ship.getLocations()).toEqual([]);
    });
  });

  describe('overlaps', () => {
    beforeEach(() => {
      ship.place(2, 3, 'horizontal'); // Locations: ['23', '24', '25']
    });

    test('should return true for overlapping coordinates', () => {
      expect(ship.overlaps(['23', '30', '31'])).toBe(true);
      expect(ship.overlaps(['20', '24', '30'])).toBe(true);
      expect(ship.overlaps(['15', '25', '35'])).toBe(true);
    });

    test('should return false for non-overlapping coordinates', () => {
      expect(ship.overlaps(['20', '21', '22'])).toBe(false);
      expect(ship.overlaps(['26', '27', '28'])).toBe(false);
      expect(ship.overlaps(['13', '14', '15'])).toBe(false);
    });

    test('should return false for empty coordinate array', () => {
      expect(ship.overlaps([])).toBe(false);
    });

    test('should handle complete overlap', () => {
      expect(ship.overlaps(['23', '24', '25'])).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle ship with length 1', () => {
      const singleShip = new Ship(1);
      singleShip.place(5, 5, 'horizontal');
      
      expect(singleShip.locations).toEqual(['55']);
      expect(singleShip.checkHit('55')).toBe(true);
      expect(singleShip.isSunk()).toBe(true);
    });

    test('should handle large ship', () => {
      const largeShip = new Ship(10);
      largeShip.place(0, 0, 'vertical');
      
      expect(largeShip.locations).toHaveLength(10);
      expect(largeShip.locations[0]).toBe('00');
      expect(largeShip.locations[9]).toBe('90');
    });
  });
}); 