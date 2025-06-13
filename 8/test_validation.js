/**
 * Comprehensive Test Suite for JavaScript Validation Library
 * 
 * This test suite provides extensive coverage including:
 * - All validator types (string, number, boolean, date, array, object, union)
 * - Valid and invalid data scenarios
 * - Edge cases and boundary conditions
 * - Error message validation
 * - Performance testing
 * - Complex integration scenarios
 */

'use strict';

const { Schema, ValidationResult } = require('./schema.js');

// Test framework with comprehensive assertion methods
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
    this.categories = new Map();
  }

  test(name, testFn, category = 'General') {
    this.tests.push({ name, testFn, category });
    if (!this.categories.has(category)) {
      this.categories.set(category, { passed: 0, failed: 0 });
    }
  }

  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message}`);
    }
  }

  assertTrue(value, message = '') {
    if (!value) {
      throw new Error(`Expected true, got ${value}. ${message}`);
    }
  }

  assertFalse(value, message = '') {
    if (value) {
      throw new Error(`Expected false, got ${value}. ${message}`);
    }
  }

  assertContains(text, substring, message = '') {
    if (typeof text !== 'string' || !text.includes(substring)) {
      throw new Error(`Expected "${text}" to contain "${substring}". ${message}`);
    }
  }

  assertArrayEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Arrays not equal. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message}`);
    }
  }

  assertValidationSuccess(result, expectedValue = undefined, message = '') {
    this.assertTrue(result.isValid, `Validation should succeed. ${message}`);
    this.assertEqual(result.errors.length, 0, `Should have no errors. ${message}`);
    if (expectedValue !== undefined) {
      this.assertEqual(result.value, expectedValue, `Value should match expected. ${message}`);
    }
  }

  assertValidationFailure(result, expectedErrorCount = undefined, message = '') {
    this.assertFalse(result.isValid, `Validation should fail. ${message}`);
    this.assertTrue(result.errors.length > 0, `Should have errors. ${message}`);
    if (expectedErrorCount !== undefined) {
      this.assertEqual(result.errors.length, expectedErrorCount, `Should have ${expectedErrorCount} errors. ${message}`);
    }
  }

  assertErrorContains(result, substring, message = '') {
    this.assertValidationFailure(result);
    const hasError = result.errors.some(error => error.includes(substring));
    this.assertTrue(hasError, `Expected error containing "${substring}". ${message}`);
  }

  async run() {
    console.log(`🧪 Running ${this.tests.length} comprehensive validation tests...\n`);
    
    const categoryResults = new Map();
    
    for (const { name, testFn, category } of this.tests) {
      try {
        await testFn();
        this.passed++;
        const cat = this.categories.get(category);
        cat.passed++;
        console.log(`✓ ${name}`);
      } catch (error) {
        this.failed++;
        const cat = this.categories.get(category);
        cat.failed++;
        this.errors.push({ name, error: error.message, category });
        console.log(`✗ ${name}: ${error.message}`);
      }
    }

    this.printResults();
    return this.failed === 0;
  }

  printResults() {
    console.log('\n' + '='.repeat(70));
    console.log(`📊 TEST RESULTS: ${this.passed} passed, ${this.failed} failed`);
    console.log('='.repeat(70));

    // Print category breakdown
    for (const [category, stats] of this.categories) {
      const status = stats.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${category}: ${stats.passed} passed, ${stats.failed} failed`);
    }

    if (this.errors.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.errors.forEach(({ name, error, category }) => {
        console.log(`  [${category}] ${name}: ${error}`);
      });
    }

    console.log('='.repeat(70));
  }
}

const test = new TestRunner();

// ============================================================================
// STRING VALIDATION TESTS
// ============================================================================

test.test('String: Valid string passes', () => {
  const validator = Schema.string();
  const result = validator.validate('hello world');
  test.assertValidationSuccess(result, 'hello world');
}, 'String Validation');

test.test('String: Non-string fails with proper error', () => {
  const validator = Schema.string();
  const result = validator.validate(123);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be a string');
}, 'String Validation');

test.test('String: Empty string passes', () => {
  const validator = Schema.string();
  const result = validator.validate('');
  test.assertValidationSuccess(result, '');
}, 'String Validation');

test.test('String: MinLength constraint passes', () => {
  const validator = Schema.string().minLength(3);
  test.assertValidationSuccess(validator.validate('hello'), 'hello');
  test.assertValidationSuccess(validator.validate('abc'), 'abc');
}, 'String Validation');

test.test('String: MinLength constraint fails', () => {
  const validator = Schema.string().minLength(5);
  const result = validator.validate('hi');
  test.assertErrorContains(result, 'Must be at least 5 characters long');
}, 'String Validation');

test.test('String: MaxLength constraint passes', () => {
  const validator = Schema.string().maxLength(10);
  test.assertValidationSuccess(validator.validate('hello'), 'hello');
  test.assertValidationSuccess(validator.validate('1234567890'), '1234567890');
}, 'String Validation');

test.test('String: MaxLength constraint fails', () => {
  const validator = Schema.string().maxLength(3);
  const result = validator.validate('hello');
  test.assertErrorContains(result, 'Must be at most 3 characters long');
}, 'String Validation');

test.test('String: Combined length constraints', () => {
  const validator = Schema.string().minLength(3).maxLength(10);
  test.assertValidationSuccess(validator.validate('hello'), 'hello');
  test.assertValidationFailure(validator.validate('hi'));
  test.assertValidationFailure(validator.validate('this is too long'));
}, 'String Validation');

test.test('String: Email validation passes for valid emails', () => {
  const validator = Schema.string().email();
  test.assertValidationSuccess(validator.validate('user@example.com'), 'user@example.com');
  test.assertValidationSuccess(validator.validate('test.email+tag@domain.co.uk'), 'test.email+tag@domain.co.uk');
}, 'String Validation');

test.test('String: Email validation fails for invalid emails', () => {
  const validator = Schema.string().email();
  test.assertErrorContains(validator.validate('invalid-email'), 'Must be a valid email address');
  test.assertErrorContains(validator.validate('@domain.com'), 'Must be a valid email address');
  test.assertErrorContains(validator.validate('user@'), 'Must be a valid email address');
}, 'String Validation');

test.test('String: URL validation passes for valid URLs', () => {
  const validator = Schema.string().url();
  test.assertValidationSuccess(validator.validate('https://example.com'), 'https://example.com');
  test.assertValidationSuccess(validator.validate('http://subdomain.example.org/path'), 'http://subdomain.example.org/path');
}, 'String Validation');

test.test('String: URL validation fails for invalid URLs', () => {
  const validator = Schema.string().url();
  test.assertErrorContains(validator.validate('not-a-url'), 'Must be a valid URL');
  test.assertErrorContains(validator.validate('ftp://example.com'), 'Must be a valid URL');
}, 'String Validation');

test.test('String: Pattern validation with regex', () => {
  const validator = Schema.string().pattern(/^[A-Z][a-z]+$/);
  test.assertValidationSuccess(validator.validate('Hello'), 'Hello');
  test.assertValidationFailure(validator.validate('hello'));
  test.assertValidationFailure(validator.validate('HELLO'));
}, 'String Validation');

test.test('String: Enum validation', () => {
  const validator = Schema.string().enum(['red', 'green', 'blue']);
  test.assertValidationSuccess(validator.validate('red'), 'red');
  test.assertValidationSuccess(validator.validate('blue'), 'blue');
  test.assertErrorContains(validator.validate('yellow'), 'Must be one of: red, green, blue');
}, 'String Validation');

test.test('String: Transform functionality', () => {
  const validator = Schema.string().transform(s => s.toUpperCase().trim());
  test.assertValidationSuccess(validator.validate('  hello  '), 'HELLO');
}, 'String Validation');

test.test('String: Custom error message', () => {
  const validator = Schema.string().minLength(8).withMessage('Password must be at least 8 characters');
  const result = validator.validate('short');
  test.assertValidationFailure(result, 1);
  test.assertEqual(result.errors[0], 'Password must be at least 8 characters');
}, 'String Validation');

// ============================================================================
// NUMBER VALIDATION TESTS  
// ============================================================================

test.test('Number: Valid integers and floats pass', () => {
  const validator = Schema.number();
  test.assertValidationSuccess(validator.validate(42), 42);
  test.assertValidationSuccess(validator.validate(3.14), 3.14);
  test.assertValidationSuccess(validator.validate(0), 0);
  test.assertValidationSuccess(validator.validate(-42), -42);
}, 'Number Validation');

test.test('Number: Non-numeric values fail', () => {
  const validator = Schema.number();
  test.assertErrorContains(validator.validate('not a number'), 'Must be a valid number');
  test.assertErrorContains(validator.validate(true), 'Must be a valid number');
  test.assertErrorContains(validator.validate(null), 'Must be a valid number');
  test.assertErrorContains(validator.validate(NaN), 'Must be a valid number');
}, 'Number Validation');

test.test('Number: Min constraint validation', () => {
  const validator = Schema.number().min(0);
  test.assertValidationSuccess(validator.validate(0), 0);
  test.assertValidationSuccess(validator.validate(42), 42);
  test.assertErrorContains(validator.validate(-1), 'Must be at least 0');
}, 'Number Validation');

test.test('Number: Max constraint validation', () => {
  const validator = Schema.number().max(100);
  test.assertValidationSuccess(validator.validate(100), 100);
  test.assertValidationSuccess(validator.validate(50), 50);
  test.assertErrorContains(validator.validate(101), 'Must be at most 100');
}, 'Number Validation');

test.test('Number: Range validation', () => {
  const validator = Schema.number().min(1).max(10);
  test.assertValidationSuccess(validator.validate(5), 5);
  test.assertValidationSuccess(validator.validate(1), 1);
  test.assertValidationSuccess(validator.validate(10), 10);
  test.assertValidationFailure(validator.validate(0));
  test.assertValidationFailure(validator.validate(11));
}, 'Number Validation');

test.test('Number: Integer validation', () => {
  const validator = Schema.number().integer();
  test.assertValidationSuccess(validator.validate(42), 42);
  test.assertValidationSuccess(validator.validate(0), 0);
  test.assertValidationSuccess(validator.validate(-5), -5);
  test.assertErrorContains(validator.validate(3.14), 'Must be an integer');
  test.assertErrorContains(validator.validate(1.1), 'Must be an integer');
}, 'Number Validation');

test.test('Number: Positive validation', () => {
  const validator = Schema.number().positive();
  test.assertValidationSuccess(validator.validate(1), 1);
  test.assertValidationSuccess(validator.validate(0.1), 0.1);
  test.assertErrorContains(validator.validate(0), 'Must be positive');
  test.assertErrorContains(validator.validate(-1), 'Must be positive');
}, 'Number Validation');

test.test('Number: Combined constraints', () => {
  const validator = Schema.number().min(1).max(100).integer().positive();
  test.assertValidationSuccess(validator.validate(50), 50);
  test.assertValidationFailure(validator.validate(0));
  test.assertValidationFailure(validator.validate(101));
  test.assertValidationFailure(validator.validate(1.5));
}, 'Number Validation');

// ============================================================================
// BOOLEAN VALIDATION TESTS
// ============================================================================

test.test('Boolean: Valid boolean values pass', () => {
  const validator = Schema.boolean();
  test.assertValidationSuccess(validator.validate(true), true);
  test.assertValidationSuccess(validator.validate(false), false);
}, 'Boolean Validation');

test.test('Boolean: Non-boolean values fail', () => {
  const validator = Schema.boolean();
  test.assertErrorContains(validator.validate('true'), 'Must be a boolean');
  test.assertErrorContains(validator.validate(1), 'Must be a boolean');
  test.assertErrorContains(validator.validate(0), 'Must be a boolean');
  test.assertErrorContains(validator.validate(null), 'Must be a boolean');
}, 'Boolean Validation');

// ============================================================================
// DATE VALIDATION TESTS
// ============================================================================

test.test('Date: Valid Date objects pass', () => {
  const validator = Schema.date();
  const date = new Date('2023-01-01');
  const result = validator.validate(date);
  test.assertValidationSuccess(result);
  test.assertTrue(result.value instanceof Date);
}, 'Date Validation');

test.test('Date: Valid date strings pass', () => {
  const validator = Schema.date();
  const result = validator.validate('2023-01-01');
  test.assertValidationSuccess(result);
  test.assertTrue(result.value instanceof Date);
}, 'Date Validation');

test.test('Date: Valid timestamps pass', () => {
  const validator = Schema.date();
  const timestamp = Date.now();
  const result = validator.validate(timestamp);
  test.assertValidationSuccess(result);
  test.assertTrue(result.value instanceof Date);
}, 'Date Validation');

test.test('Date: Invalid date values fail', () => {
  const validator = Schema.date();
  test.assertErrorContains(validator.validate('invalid-date'), 'Must be a valid date');
  test.assertErrorContains(validator.validate('2023-13-01'), 'Must be a valid date');
  test.assertErrorContains(validator.validate(true), 'Must be a valid date');
}, 'Date Validation');

test.test('Date: Min date constraint', () => {
  const validator = Schema.date().min('2020-01-01');
  test.assertValidationSuccess(validator.validate('2023-01-01'));
  test.assertValidationSuccess(validator.validate('2020-01-01'));
  test.assertErrorContains(validator.validate('2019-12-31'), 'Date must be after');
}, 'Date Validation');

test.test('Date: Max date constraint', () => {
  const validator = Schema.date().max('2025-01-01');
  test.assertValidationSuccess(validator.validate('2023-01-01'));
  test.assertValidationSuccess(validator.validate('2025-01-01'));
  test.assertErrorContains(validator.validate('2026-01-01'), 'Date must be before');
}, 'Date Validation');

// ============================================================================
// ARRAY VALIDATION TESTS
// ============================================================================

test.test('Array: Valid arrays pass', () => {
  const validator = Schema.array(Schema.string());
  test.assertValidationSuccess(validator.validate(['a', 'b', 'c']));
  test.assertValidationSuccess(validator.validate([]));
}, 'Array Validation');

test.test('Array: Non-arrays fail', () => {
  const validator = Schema.array(Schema.string());
  test.assertErrorContains(validator.validate('not an array'), 'Must be an array');
  test.assertErrorContains(validator.validate(123), 'Must be an array');
  test.assertErrorContains(validator.validate({}), 'Must be an array');
}, 'Array Validation');

test.test('Array: Min items constraint', () => {
  const validator = Schema.array(Schema.string()).min(2);
  test.assertValidationSuccess(validator.validate(['a', 'b']));
  test.assertValidationSuccess(validator.validate(['a', 'b', 'c']));
  test.assertErrorContains(validator.validate(['a']), 'Must have at least 2 items');
  test.assertErrorContains(validator.validate([]), 'Must have at least 2 items');
}, 'Array Validation');

test.test('Array: Max items constraint', () => {
  const validator = Schema.array(Schema.string()).max(2);
  test.assertValidationSuccess(validator.validate(['a', 'b']));
  test.assertValidationSuccess(validator.validate(['a']));
  test.assertErrorContains(validator.validate(['a', 'b', 'c']), 'Must have at most 2 items');
}, 'Array Validation');

test.test('Array: Unique items constraint', () => {
  const validator = Schema.array(Schema.string()).unique();
  test.assertValidationSuccess(validator.validate(['a', 'b', 'c']));
  test.assertValidationSuccess(validator.validate([]));
  test.assertErrorContains(validator.validate(['a', 'b', 'a']), 'Duplicate items found');
}, 'Array Validation');

test.test('Array: Item validation', () => {
  const validator = Schema.array(Schema.number().min(0));
  test.assertValidationSuccess(validator.validate([1, 2, 3]));
  test.assertValidationFailure(validator.validate([1, -2, 3]));
  test.assertContains(validator.validate([1, -2, 3]).errors[0], 'Must be at least 0 at [1]');
}, 'Array Validation');

test.test('Array: Multiple item validation failures', () => {
  const validator = Schema.array(Schema.string().minLength(2));
  const result = validator.validate(['ab', 'a', 'cd', 'e']);
  test.assertValidationFailure(result, 2);
  test.assertContains(result.errors[0], 'Must be at least 2 characters long at [1]');
  test.assertContains(result.errors[1], 'Must be at least 2 characters long at [3]');
}, 'Array Validation');

test.test('Array: Complex nested validation', () => {
  const validator = Schema.array(
    Schema.object({
      name: Schema.string().minLength(1),
      age: Schema.number().min(0)
    })
  );
  const data = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ];
  test.assertValidationSuccess(validator.validate(data));
}, 'Array Validation');

// ============================================================================
// OBJECT VALIDATION TESTS
// ============================================================================

test.test('Object: Valid objects pass', () => {
  const validator = Schema.object({
    name: Schema.string(),
    age: Schema.number()
  });
  test.assertValidationSuccess(validator.validate({ name: 'John', age: 30 }));
}, 'Object Validation');

test.test('Object: Non-objects fail', () => {
  const validator = Schema.object({});
  test.assertErrorContains(validator.validate('string'), 'Must be an object');
  test.assertErrorContains(validator.validate(123), 'Must be an object');
  test.assertErrorContains(validator.validate(null), 'Must be an object');
  test.assertErrorContains(validator.validate([]), 'Must be an object');
}, 'Object Validation');

test.test('Object: Field validation', () => {
  const validator = Schema.object({
    email: Schema.string().email(),
    age: Schema.number().min(0)
  });
  test.assertValidationSuccess(validator.validate({ email: 'test@example.com', age: 25 }));
  test.assertErrorContains(validator.validate({ email: 'invalid', age: 25 }), 'Must be a valid email address');
  test.assertErrorContains(validator.validate({ email: 'test@example.com', age: -5 }), 'Must be at least 0');
}, 'Object Validation');

test.test('Object: Multiple field validation failures', () => {
  const validator = Schema.object({
    name: Schema.string().minLength(2),
    age: Schema.number().min(0),
    email: Schema.string().email()
  });
  const result = validator.validate({ name: 'J', age: -5, email: 'invalid' });
  test.assertValidationFailure(result, 3);
}, 'Object Validation');

test.test('Object: Strict mode rejects unknown fields', () => {
  const validator = Schema.object({
    name: Schema.string()
  }).strict();
  test.assertValidationSuccess(validator.validate({ name: 'John' }));
  test.assertErrorContains(validator.validate({ name: 'John', extra: 'field' }), 'Unknown field: extra');
}, 'Object Validation');

test.test('Object: Passthrough mode allows unknown fields', () => {
  const validator = Schema.object({
    name: Schema.string()
  }).passthrough();
  const result = validator.validate({ name: 'John', extra: 'field' });
  test.assertValidationSuccess(result);
  test.assertEqual(result.value.extra, 'field');
}, 'Object Validation');

test.test('Object: Required fields validation', () => {
  const validator = Schema.object({
    name: Schema.string(),
    email: Schema.string()
  }).required(['name', 'email']);
  test.assertValidationSuccess(validator.validate({ name: 'John', email: 'john@example.com' }));
  test.assertErrorContains(validator.validate({ name: 'John' }), 'Missing required field: email');
}, 'Object Validation');

test.test('Object: Deeply nested validation', () => {
  const validator = Schema.object({
    user: Schema.object({
      profile: Schema.object({
        name: Schema.string(),
        contact: Schema.object({
          email: Schema.string().email()
        })
      })
    })
  });
  
  const validData = {
    user: {
      profile: {
        name: 'John',
        contact: {
          email: 'john@example.com'
        }
      }
    }
  };
  
  test.assertValidationSuccess(validator.validate(validData));
}, 'Object Validation');

test.test('Object: Nested validation with path errors', () => {
  const validator = Schema.object({
    user: Schema.object({
      email: Schema.string().email()
    })
  });
  const result = validator.validate({ user: { email: 'invalid' } });
  test.assertErrorContains(result, 'Must be a valid email address at user.email');
}, 'Object Validation');

// ============================================================================
// UNION TYPE TESTS
// ============================================================================

test.test('Union: First validator matches', () => {
  const validator = Schema.union(Schema.string(), Schema.number());
  test.assertValidationSuccess(validator.validate('hello'), 'hello');
}, 'Union Types');

test.test('Union: Second validator matches', () => {
  const validator = Schema.union(Schema.string(), Schema.number());
  test.assertValidationSuccess(validator.validate(42), 42);
}, 'Union Types');

test.test('Union: No validator matches', () => {
  const validator = Schema.union(Schema.string(), Schema.number());
  test.assertErrorContains(validator.validate(true), 'Value does not match any of the expected types');
}, 'Union Types');

test.test('Union: Complex type combinations', () => {
  const validator = Schema.union(
    Schema.string().email(),
    Schema.object({ id: Schema.number() }),
    Schema.array(Schema.string())
  );
  
  test.assertValidationSuccess(validator.validate('test@example.com'), 'test@example.com');
  test.assertValidationSuccess(validator.validate({ id: 123 }));
  test.assertValidationSuccess(validator.validate(['a', 'b']));
  test.assertValidationFailure(validator.validate('invalid-email'));
}, 'Union Types');

// ============================================================================
// OPTIONAL FIELDS TESTS
// ============================================================================

test.test('Optional: Undefined values pass', () => {
  const validator = Schema.string().optional();
  test.assertValidationSuccess(validator.validate(undefined), undefined);
}, 'Optional Fields');

test.test('Optional: Null values pass', () => {
  const validator = Schema.string().optional();
  test.assertValidationSuccess(validator.validate(null), null);
}, 'Optional Fields');

test.test('Optional: Valid values pass normally', () => {
  const validator = Schema.string().minLength(3).optional();
  test.assertValidationSuccess(validator.validate('hello'), 'hello');
}, 'Optional Fields');

test.test('Optional: Invalid values still fail validation', () => {
  const validator = Schema.string().minLength(5).optional();
  test.assertValidationFailure(validator.validate('hi'));
}, 'Optional Fields');

test.test('Required: Undefined values fail', () => {
  const validator = Schema.string();
  test.assertErrorContains(validator.validate(undefined), 'Field is required');
}, 'Optional Fields');

test.test('Required: Null values fail', () => {
  const validator = Schema.string();
  test.assertErrorContains(validator.validate(null), 'Field is required');
}, 'Optional Fields');

test.test('Optional: In object context', () => {
  const validator = Schema.object({
    name: Schema.string(),
    bio: Schema.string().optional()
  });
  test.assertValidationSuccess(validator.validate({ name: 'John' }));
  test.assertValidationSuccess(validator.validate({ name: 'John', bio: 'Developer' }));
}, 'Optional Fields');

// ============================================================================
// LITERAL AND ANY TYPE TESTS
// ============================================================================

test.test('Literal: Exact string match', () => {
  const validator = Schema.literal('admin');
  test.assertValidationSuccess(validator.validate('admin'), 'admin');
  test.assertErrorContains(validator.validate('user'), 'Must be exactly: "admin"');
}, 'Literal & Any Types');

test.test('Literal: Exact number match', () => {
  const validator = Schema.literal(42);
  test.assertValidationSuccess(validator.validate(42), 42);
  test.assertValidationFailure(validator.validate(43));
}, 'Literal & Any Types');

test.test('Literal: Exact boolean match', () => {
  const validator = Schema.literal(true);
  test.assertValidationSuccess(validator.validate(true), true);
  test.assertValidationFailure(validator.validate(false));
}, 'Literal & Any Types');

test.test('Any: Accepts all value types', () => {
  const validator = Schema.any();
  test.assertValidationSuccess(validator.validate('string'), 'string');
  test.assertValidationSuccess(validator.validate(123), 123);
  test.assertValidationSuccess(validator.validate(true), true);
  test.assertValidationSuccess(validator.validate(null), null);
  test.assertValidationSuccess(validator.validate(undefined), undefined);
  test.assertValidationSuccess(validator.validate([1, 2, 3]));
  test.assertValidationSuccess(validator.validate({ key: 'value' }));
}, 'Literal & Any Types');

// ============================================================================
// TRANSFORMATION TESTS
// ============================================================================

test.test('Transform: String transformations', () => {
  const validator = Schema.string().transform(s => s.toUpperCase().trim());
  test.assertValidationSuccess(validator.validate('  hello  '), 'HELLO');
}, 'Transformations');

test.test('Transform: Number transformations', () => {
  const validator = Schema.number().transform(n => Math.round(n * 100) / 100);
  test.assertValidationSuccess(validator.validate(3.14159), 3.14);
}, 'Transformations');

test.test('Transform: Chained transformations', () => {
  const validator = Schema.string()
    .transform(s => s.trim())
    .transform(s => s.toLowerCase())
    .transform(s => s.replace(/\s+/g, '-'));
  test.assertValidationSuccess(validator.validate('  Hello World  '), 'hello-world');
}, 'Transformations');

test.test('Transform: Only applied after successful validation', () => {
  const validator = Schema.string().minLength(5).transform(s => s.toUpperCase());
  const result = validator.validate('hi');
  test.assertValidationFailure(result);
  test.assertEqual(result.value, null);
}, 'Transformations');

test.test('Transform: Error handling', () => {
  const validator = Schema.string().transform(s => {
    throw new Error('Transform error');
  });
  test.assertErrorContains(validator.validate('hello'), 'Transformation failed: Transform error');
}, 'Transformations');

// ============================================================================
// CUSTOM ERROR MESSAGE TESTS
// ============================================================================

test.test('Custom Messages: String validator', () => {
  const validator = Schema.string().minLength(8).withMessage('Password must be at least 8 characters');
  const result = validator.validate('short');
  test.assertEqual(result.errors[0], 'Password must be at least 8 characters');
}, 'Custom Messages');

test.test('Custom Messages: Number validator', () => {
  const validator = Schema.number().min(18).withMessage('Must be 18 or older');
  const result = validator.validate(16);
  test.assertEqual(result.errors[0], 'Must be 18 or older');
}, 'Custom Messages');

test.test('Custom Messages: Object field validation', () => {
  const validator = Schema.object({
    age: Schema.number().min(18).withMessage('Age must be 18 or older')
  });
  const result = validator.validate({ age: 16 });
  test.assertEqual(result.errors[0], 'Age must be 18 or older');
}, 'Custom Messages');

// ============================================================================
// COMPLEX INTEGRATION TESTS
// ============================================================================

test.test('Integration: User registration schema', () => {
  const registrationSchema = Schema.object({
    username: Schema.string()
      .minLength(3)
      .maxLength(20)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .transform(s => s.toLowerCase()),
    email: Schema.string().email(),
    password: Schema.string().minLength(8),
    confirmPassword: Schema.string(),
    age: Schema.number().min(13).max(120).integer(),
    terms: Schema.literal(true),
    newsletter: Schema.boolean().optional()
  }).strict();

  const validData = {
    username: 'JohnDoe123',
    email: 'john@example.com',
    password: 'securepassword',
    confirmPassword: 'securepassword',
    age: 25,
    terms: true,
    newsletter: false
  };

  const result = registrationSchema.validate(validData);
  test.assertValidationSuccess(result);
  test.assertEqual(result.value.username, 'johndoe123'); // Transformed to lowercase
}, 'Complex Integration');

test.test('Integration: E-commerce product schema', () => {
  const productSchema = Schema.object({
    id: Schema.string().pattern(/^prod_[a-zA-Z0-9]+$/),
    name: Schema.string().minLength(1).maxLength(100),
    price: Schema.number().min(0.01).max(999999.99),
    currency: Schema.string().enum(['USD', 'EUR', 'GBP']),
    category: Schema.string().minLength(1),
    tags: Schema.array(Schema.string()).min(1).max(10).unique(),
    inStock: Schema.boolean(),
    variants: Schema.array(Schema.object({
      sku: Schema.string().minLength(1),
      size: Schema.string().optional(),
      color: Schema.string().optional(),
      price: Schema.number().min(0).optional()
    })).optional()
  });

  const validProduct = {
    id: 'prod_abc123',
    name: 'Premium T-Shirt',
    price: 29.99,
    currency: 'USD',
    category: 'clothing',
    tags: ['cotton', 'premium'],
    inStock: true,
    variants: [
      { sku: 'tshirt-red-m', size: 'M', color: 'red' },
      { sku: 'tshirt-blue-l', size: 'L', color: 'blue', price: 31.99 }
    ]
  };

  test.assertValidationSuccess(productSchema.validate(validProduct));
}, 'Complex Integration');

test.test('Integration: API request validation', () => {
  const apiSchema = Schema.object({
    method: Schema.string().enum(['GET', 'POST', 'PUT', 'DELETE']),
    path: Schema.string().pattern(/^\/[a-zA-Z0-9\/\-_]*$/),
    headers: Schema.object({
      'content-type': Schema.string().optional(),
      'authorization': Schema.string().pattern(/^Bearer .+/).optional()
    }).passthrough(),
    body: Schema.union(
      Schema.object({}).passthrough(),
      Schema.string(),
      Schema.any()
    ).optional(),
    timestamp: Schema.date().max(new Date())
  }).strict();

  const validRequest = {
    method: 'POST',
    path: '/api/users',
    headers: {
      'content-type': 'application/json',
      'authorization': 'Bearer abc123token',
      'user-agent': 'MyApp/1.0'
    },
    body: { name: 'John Doe', email: 'john@example.com' },
    timestamp: new Date(Date.now() - 1000)
  };

  test.assertValidationSuccess(apiSchema.validate(validRequest));
}, 'Complex Integration');

// ============================================================================
// EDGE CASES AND BOUNDARY CONDITIONS
// ============================================================================

test.test('Edge: Very long string handling', () => {
  const validator = Schema.string().maxLength(10000);
  const veryLongString = 'a'.repeat(5000);
  test.assertValidationSuccess(validator.validate(veryLongString), veryLongString);
}, 'Edge Cases');

test.test('Edge: Large numbers', () => {
  const validator = Schema.number();
  test.assertValidationSuccess(validator.validate(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
  test.assertValidationSuccess(validator.validate(Number.MIN_SAFE_INTEGER), Number.MIN_SAFE_INTEGER);
}, 'Edge Cases');

test.test('Edge: Special characters in strings', () => {
  const validator = Schema.string();
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\n\\t\\r';
  test.assertValidationSuccess(validator.validate(specialChars), specialChars);
}, 'Edge Cases');

test.test('Edge: Unicode and emoji handling', () => {
  const validator = Schema.string();
  const unicodeString = '你好世界 🌍 🚀 ñáéíóú';
  test.assertValidationSuccess(validator.validate(unicodeString), unicodeString);
}, 'Edge Cases');

test.test('Edge: Deeply nested objects', () => {
  const deepSchema = Schema.object({
    level1: Schema.object({
      level2: Schema.object({
        level3: Schema.object({
          level4: Schema.object({
            value: Schema.string()
          })
        })
      })
    })
  });

  const deepObject = {
    level1: {
      level2: {
        level3: {
          level4: {
            value: 'deep value'
          }
        }
      }
    }
  };

  test.assertValidationSuccess(deepSchema.validate(deepObject));
}, 'Edge Cases');

test.test('Edge: Empty collections', () => {
  const arrayValidator = Schema.array(Schema.string());
  const objectValidator = Schema.object({});
  
  test.assertValidationSuccess(arrayValidator.validate([]), []);
  test.assertValidationSuccess(objectValidator.validate({}), {});
}, 'Edge Cases');

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

test.test('Performance: Large array validation', () => {
  const validator = Schema.array(Schema.string().minLength(1));
  const largeArray = Array(1000).fill('test');
  
  const start = Date.now();
  const result = validator.validate(largeArray);
  const duration = Date.now() - start;
  
  test.assertValidationSuccess(result);
  test.assertTrue(duration < 100, `Large array validation should be fast, took ${duration}ms`);
}, 'Performance');

test.test('Performance: Complex object validation', () => {
  const complexSchema = Schema.object({
    users: Schema.array(Schema.object({
      name: Schema.string().minLength(1),
      email: Schema.string().email(),
      age: Schema.number().min(0).max(150),
      tags: Schema.array(Schema.string()).unique()
    }))
  });

  const complexData = {
    users: Array(100).fill(null).map((_, i) => ({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 50),
      tags: [`tag${i}`, `category${i % 5}`]
    }))
  };

  const start = Date.now();
  const result = complexSchema.validate(complexData);
  const duration = Date.now() - start;

  test.assertValidationSuccess(result);
  test.assertTrue(duration < 200, `Complex validation should be efficient, took ${duration}ms`);
}, 'Performance');

test.test('Performance: Deep nesting validation', () => {
  const createDeepSchema = (depth) => {
    if (depth === 0) return Schema.string();
    return Schema.object({ next: createDeepSchema(depth - 1) });
  };

  const createDeepObject = (depth) => {
    if (depth === 0) return 'deep value';
    return { next: createDeepObject(depth - 1) };
  };

  const deepSchema = createDeepSchema(50);
  const deepObject = createDeepObject(50);

  const start = Date.now();
  const result = deepSchema.validate(deepObject);
  const duration = Date.now() - start;

  test.assertValidationSuccess(result);
  test.assertTrue(duration < 50, `Deep nesting validation should be fast, took ${duration}ms`);
}, 'Performance');

// ============================================================================
// RUN ALL TESTS
// ============================================================================

console.log('🧪 JavaScript Validation Library - Comprehensive Test Suite');
console.log('Testing all validation scenarios, edge cases, and performance...\n');

test.run().then(success => {
  if (success) {
    console.log('\n🎉 ALL TESTS PASSED! The validation library is production-ready.');
    console.log('\n📋 Test Coverage Summary:');
    console.log('✅ String validation with all constraints and formats');
    console.log('✅ Number validation with ranges, types, and boundaries');
    console.log('✅ Boolean validation with strict type checking');
    console.log('✅ Date validation with parsing and range constraints');
    console.log('✅ Array validation with item validation and constraints');
    console.log('✅ Object validation with nested schemas and modes');
    console.log('✅ Union types for flexible data structures');
    console.log('✅ Optional fields with proper null/undefined handling');
    console.log('✅ Literal values and any type validation');
    console.log('✅ Data transformations with error handling');
    console.log('✅ Custom error messages and path reporting');
    console.log('✅ Complex real-world integration scenarios');
    console.log('✅ Edge cases and boundary conditions');
    console.log('✅ Performance testing for large datasets');
    console.log('\n🚀 Ready for production use!');
  } else {
    console.log('\n❌ Some tests failed. Please review the failures above.');
    process.exit(1);
  }
}); 