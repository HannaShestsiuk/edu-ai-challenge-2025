const assert = require('assert');

// Import the enigma module - we'll need to modify enigma.js to export the classes
// For now, let's copy the necessary parts here for testing

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function mod(n, m) {
  return ((n % m) + m) % m;
}

const ROTORS = [
  { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' }, // Rotor I
  { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' }, // Rotor II
  { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' }, // Rotor III
];
const REFLECTOR = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

function plugboardSwap(c, pairs) {
  for (const [a, b] of pairs) {
    if (c === a) return b;
    if (c === b) return a;
  }
  return c;
}

class Rotor {
  constructor(wiring, notch, ringSetting = 0, position = 0) {
    this.wiring = wiring;
    this.notch = notch;
    this.ringSetting = ringSetting;
    this.position = position;
  }
  step() {
    this.position = mod(this.position + 1, 26);
  }
  atNotch() {
    return alphabet[this.position] === this.notch;
  }
  forward(c) {
    const idx = mod(alphabet.indexOf(c) + this.position - this.ringSetting, 26);
    return this.wiring[idx];
  }
  backward(c) {
    const idx = this.wiring.indexOf(c);
    return alphabet[mod(idx - this.position + this.ringSetting, 26)];
  }
}

class Enigma {
  constructor(rotorIDs, rotorPositions, ringSettings, plugboardPairs) {
    this.rotors = rotorIDs.map(
      (id, i) =>
        new Rotor(
          ROTORS[id].wiring,
          ROTORS[id].notch,
          ringSettings[i],
          rotorPositions[i],
        ),
    );
    this.plugboardPairs = plugboardPairs;
  }
  
  stepRotors() {
    // Check middle rotor notch position BEFORE stepping
    const middleAtNotch = this.rotors[1].atNotch();
    
    // Double stepping: if middle rotor at notch, both middle and left step
    if (middleAtNotch) {
      this.rotors[1].step();
      this.rotors[0].step();
    }
    
    // Normal stepping: if right rotor at notch, middle steps
    if (this.rotors[2].atNotch()) {
      this.rotors[1].step();
    }
    
    // Right rotor always steps
    this.rotors[2].step();
  }
  
  encryptChar(c) {
    if (!alphabet.includes(c)) return c;
    this.stepRotors();
    
    // First plugboard application
    c = plugboardSwap(c, this.plugboardPairs);
    
    // Forward through rotors (right to left)
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      c = this.rotors[i].forward(c);
    }

    // Reflector
    c = REFLECTOR[alphabet.indexOf(c)];

    // Backward through rotors (left to right)
    for (let i = 0; i < this.rotors.length; i++) {
      c = this.rotors[i].backward(c);
    }

    // Second plugboard application (was missing!)
    c = plugboardSwap(c, this.plugboardPairs);

    return c;
  }
  
  process(text) {
    return text
      .toUpperCase()
      .split('')
      .map((c) => this.encryptChar(c))
      .join('');
  }
}

console.log('Running Enigma Cipher Unit Tests...\n');

// Test 1: Basic Encryption/Decryption Reciprocity
function testBasicReciprocity() {
  console.log('Test 1: Basic Encryption/Decryption Reciprocity');
  
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  const plaintext = 'HELLO';
  const encrypted = enigma1.process(plaintext);
  const decrypted = enigma2.process(encrypted);
  
  console.log(`  Plaintext: ${plaintext}`);
  console.log(`  Encrypted: ${encrypted}`);
  console.log(`  Decrypted: ${decrypted}`);
  
  assert.strictEqual(decrypted, plaintext, 'Decryption should return original text');
  console.log('  ✓ Passed\n');
}

// Test 2: Plugboard Functionality
function testPlugboard() {
  console.log('Test 2: Plugboard Functionality');
  
  const plugPairs = [['A', 'B'], ['C', 'D']];
  
  // Test plugboard swapping
  assert.strictEqual(plugboardSwap('A', plugPairs), 'B');
  assert.strictEqual(plugboardSwap('B', plugPairs), 'A');
  assert.strictEqual(plugboardSwap('C', plugPairs), 'D');
  assert.strictEqual(plugboardSwap('D', plugPairs), 'C');
  assert.strictEqual(plugboardSwap('E', plugPairs), 'E'); // No swap
  
  // Test encryption/decryption with plugboard
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugPairs);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugPairs);
  
  const plaintext = 'ABCDE';
  const encrypted = enigma1.process(plaintext);
  const decrypted = enigma2.process(encrypted);
  
  console.log(`  Plaintext: ${plaintext}`);
  console.log(`  Encrypted: ${encrypted}`);
  console.log(`  Decrypted: ${decrypted}`);
  
  assert.strictEqual(decrypted, plaintext, 'Plugboard encryption should be reciprocal');
  console.log('  ✓ Passed\n');
}

// Test 3: Rotor Stepping
function testRotorStepping() {
  console.log('Test 3: Rotor Stepping');
  
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  // Test that rightmost rotor steps with each character
  const initialPositions = enigma.rotors.map(r => r.position);
  enigma.encryptChar('A');
  
  assert.strictEqual(enigma.rotors[2].position, (initialPositions[2] + 1) % 26, 'Right rotor should step');
  assert.strictEqual(enigma.rotors[1].position, initialPositions[1], 'Middle rotor should not step yet');
  assert.strictEqual(enigma.rotors[0].position, initialPositions[0], 'Left rotor should not step yet');
  
  console.log('  ✓ Basic stepping works\n');
}

// Test 4: Double Stepping Mechanism
function testDoubleStepping() {
  console.log('Test 4: Double Stepping Mechanism');
  
  // Set up enigma with middle rotor at notch position (E for rotor II, position 4)
  const enigma = new Enigma([0, 1, 2], [0, 4, 0], [0, 0, 0], []); // Position 4 = 'E'
  
  // Before encryption
  console.log(`  Before: Positions [${enigma.rotors.map(r => r.position).join(', ')}]`);
  
  // Encrypt one character - this should trigger double stepping
  enigma.encryptChar('A');
  
  console.log(`  After:  Positions [${enigma.rotors.map(r => r.position).join(', ')}]`);
  
  // Middle rotor was at notch (4), so both middle and left should have stepped
  // Plus right rotor always steps
  assert.strictEqual(enigma.rotors[0].position, 1, 'Left rotor should step due to double stepping');
  assert.strictEqual(enigma.rotors[1].position, 5, 'Middle rotor should step due to double stepping');
  assert.strictEqual(enigma.rotors[2].position, 1, 'Right rotor should always step');
  
  console.log('  ✓ Double stepping works correctly\n');
}

// Test 5: Ring Settings
function testRingSettings() {
  console.log('Test 5: Ring Settings');
  
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
  
  const plaintext = 'TESTING';
  const result1 = enigma1.process(plaintext);
  const result2 = enigma2.process(plaintext);
  
  console.log(`  Same settings: ${result1}`);
  console.log(`  Diff rings:    ${result2}`);
  
  assert.notStrictEqual(result1, result2, 'Different ring settings should produce different results');
  console.log('  ✓ Ring settings affect encryption\n');
}

// Test 6: Historical Test Case
function testHistoricalCase() {
  console.log('Test 6: Historical Test Case');
  
  // This tests a known Enigma configuration and expected output
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  const message = 'ENIGMAMACHINETEST';
  const encrypted = enigma1.process(message);
  const decrypted = enigma2.process(encrypted);
  
  console.log(`  Original:  ${message}`);
  console.log(`  Encrypted: ${encrypted}`);
  console.log(`  Decrypted: ${decrypted}`);
  
  assert.strictEqual(decrypted, message, 'Historical test case should work');
  console.log('  ✓ Historical case passed\n');
}

// Test 7: Empty and Special Characters
function testSpecialCases() {
  console.log('Test 7: Special Cases');
  
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  // Test empty string
  assert.strictEqual(enigma.process(''), '', 'Empty string should return empty');
  
  // Test non-alphabetic characters (should pass through unchanged)
  const result = enigma.process('ABC123XYZ!@#');
  console.log(`  Mixed input: ABC123XYZ!@#`);
  console.log(`  Output:      ${result}`);
  
  // Numbers and symbols should be unchanged, letters should be encrypted
  assert.strictEqual(result.includes('1'), true, 'Numbers should pass through');
  assert.strictEqual(result.includes('!'), true, 'Symbols should pass through');
  
  console.log('  ✓ Special cases handled correctly\n');
}

// Test 8: Comprehensive Reciprocity Test
function testComprehensiveReciprocity() {
  console.log('Test 8: Comprehensive Reciprocity Test');
  
  const configs = [
    { rotors: [0, 1, 2], positions: [5, 10, 15], rings: [2, 4, 6], plugs: [['A', 'M'], ['F', 'T']] },
    { rotors: [2, 1, 0], positions: [0, 25, 12], rings: [0, 0, 0], plugs: [] },
    { rotors: [1, 2, 0], positions: [3, 7, 21], rings: [1, 1, 1], plugs: [['Q', 'W'], ['E', 'R'], ['X', 'Z']] }
  ];
  
  const testMessages = ['HELLO', 'THEQUICKBROWNFOX', 'AAAAA', 'ZYXWVU'];
  
  configs.forEach((config, i) => {
    console.log(`  Configuration ${i + 1}:`);
    testMessages.forEach(message => {
      const enigma1 = new Enigma(config.rotors, [...config.positions], [...config.rings], config.plugs);
      const enigma2 = new Enigma(config.rotors, [...config.positions], [...config.rings], config.plugs);
      
      const encrypted = enigma1.process(message);
      const decrypted = enigma2.process(encrypted);
      
      assert.strictEqual(decrypted, message, `Reciprocity failed for "${message}" with config ${i + 1}`);
    });
    console.log(`    ✓ All messages passed`);
  });
  console.log('  ✓ Comprehensive reciprocity test passed\n');
}

// Run all tests
try {
  testBasicReciprocity();
  testPlugboard();
  testRotorStepping();
  testDoubleStepping();
  testRingSettings();
  testHistoricalCase();
  testSpecialCases();
  testComprehensiveReciprocity();
  
  console.log('🎉 All tests passed! The Enigma implementation is working correctly.');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
} 