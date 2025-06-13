/**
 * Comprehensive Test Suite for JavaScript Validation Library
 * 
 * This test suite provides extensive coverage of all validation scenarios,
 * edge cases, error conditions, and performance characteristics.
 * 
 * Test Categories:
 * - String Validation Tests
 * - Number Validation Tests  
 * - Boolean Validation Tests
 * - Date Validation Tests
 * - Array Validation Tests
 * - Object Validation Tests
 * - Union Type Tests
 * - Edge Case Tests
 * - Error Handling Tests
 * - Performance Tests
 * - Integration Tests
 */

'use strict';

const { 
  Schema, 
  ValidationResult, 
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ArrayValidator,
  ObjectValidator,
  UnionValidator
} = require('./schema.js');

// Simple testing framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
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

  assertArrayEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Arrays not equal. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message}`);
    }
  }

  assertContains(array, item, message = '') {
    if (!array.includes(item)) {
      throw new Error(`Array ${JSON.stringify(array)} does not contain ${item}. ${message}`);
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

  async run() {
    console.log(`Running ${this.tests.length} tests...\n`);
    
    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        this.passed++;
        console.log(`✓ ${name}`);
      } catch (error) {
        this.failed++;
        this.errors.push({ name, error: error.message });
        console.log(`✗ ${name}: ${error.message}`);
      }
    }

    console.log(`\n${this.passed} passed, ${this.failed} failed`);
    
    if (this.errors.length > 0) {
      console.log('\nFailed Tests:');
      this.errors.forEach(({ name, error }) => {
        console.log(`  ${name}: ${error}`);
      });
    }

    return this.failed === 0;
  }
}

const runner = new TestRunner();

// ============================================================================
// STRING VALIDATION TESTS
// ============================================================================

runner.test('String: Valid string passes validation', () => {
  const validator = Schema.string();
  const result = validator.validate('hello');
  runner.assertValidationSuccess(result, 'hello');
});

runner.test('String: Non-string value fails validation', () => {
  const validator = Schema.string();
  const result = validator.validate(123);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a string');
});

runner.test('String: MinLength validation passes for valid length', () => {
  const validator = Schema.string().minLength(3);
  const result = validator.validate('hello');
  runner.assertValidationSuccess(result, 'hello');
});

runner.test('String: MinLength validation fails for short string', () => {
  const validator = Schema.string().minLength(5);
  const result = validator.validate('hi');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be at least 5 characters long');
});

runner.test('String: MaxLength validation passes for valid length', () => {
  const validator = Schema.string().maxLength(10);
  const result = validator.validate('hello');
  runner.assertValidationSuccess(result, 'hello');
});

runner.test('String: MaxLength validation fails for long string', () => {
  const validator = Schema.string().maxLength(3);
  const result = validator.validate('hello');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be at most 3 characters long');
});

runner.test('String: Pattern validation passes for matching pattern', () => {
  const validator = Schema.string().pattern(/^[A-Z]+$/);
  const result = validator.validate('HELLO');
  runner.assertValidationSuccess(result, 'HELLO');
});

runner.test('String: Pattern validation fails for non-matching pattern', () => {
  const validator = Schema.string().pattern(/^[A-Z]+$/);
  const result = validator.validate('hello');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Does not match required pattern');
});

runner.test('String: Email validation passes for valid email', () => {
  const validator = Schema.string().email();
  const result = validator.validate('user@example.com');
  runner.assertValidationSuccess(result, 'user@example.com');
});

runner.test('String: Email validation fails for invalid email', () => {
  const validator = Schema.string().email();
  const result = validator.validate('invalid-email');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a valid email address');
});

runner.test('String: URL validation passes for valid URL', () => {
  const validator = Schema.string().url();
  const result = validator.validate('https://example.com');
  runner.assertValidationSuccess(result, 'https://example.com');
});

runner.test('String: URL validation fails for invalid URL', () => {
  const validator = Schema.string().url();
  const result = validator.validate('not-a-url');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a valid URL');
});

runner.test('String: Enum validation passes for valid value', () => {
  const validator = Schema.string().enum(['red', 'green', 'blue']);
  const result = validator.validate('red');
  runner.assertValidationSuccess(result, 'red');
});

runner.test('String: Enum validation fails for invalid value', () => {
  const validator = Schema.string().enum(['red', 'green', 'blue']);
  const result = validator.validate('yellow');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be one of: red, green, blue');
});

runner.test('String: Multiple validation rules combined', () => {
  const validator = Schema.string().minLength(3).maxLength(10).pattern(/^[a-z]+$/);
  const result = validator.validate('hello');
  runner.assertValidationSuccess(result, 'hello');
});

runner.test('String: Multiple validation failures', () => {
  const validator = Schema.string().minLength(10).maxLength(5);
  const result = validator.validate('hello');
  runner.assertValidationFailure(result, 2);
  runner.assertContains(result.errors[0], 'Must be at least 10 characters long');
  runner.assertContains(result.errors[1], 'Must be at most 5 characters long');
});

runner.test('String: Transformation after successful validation', () => {
  const validator = Schema.string().transform(s => s.toUpperCase());
  const result = validator.validate('hello');
  runner.assertValidationSuccess(result, 'HELLO');
});

runner.test('String: Custom error message', () => {
  const validator = Schema.string().minLength(5).withMessage('Password too short');
  const result = validator.validate('hi');
  runner.assertValidationFailure(result, 1);
  runner.assertEqual(result.errors[0], 'Password too short');
});

// ============================================================================
// NUMBER VALIDATION TESTS
// ============================================================================

runner.test('Number: Valid number passes validation', () => {
  const validator = Schema.number();
  const result = validator.validate(42);
  runner.assertValidationSuccess(result, 42);
});

runner.test('Number: Non-number value fails validation', () => {
  const validator = Schema.number();
  const result = validator.validate('not a number');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a valid number');
});

runner.test('Number: NaN fails validation', () => {
  const validator = Schema.number();
  const result = validator.validate(NaN);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a valid number');
});

runner.test('Number: Min validation passes for valid value', () => {
  const validator = Schema.number().min(0);
  const result = validator.validate(5);
  runner.assertValidationSuccess(result, 5);
});

runner.test('Number: Min validation fails for low value', () => {
  const validator = Schema.number().min(10);
  const result = validator.validate(5);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be at least 10');
});

runner.test('Number: Max validation passes for valid value', () => {
  const validator = Schema.number().max(100);
  const result = validator.validate(50);
  runner.assertValidationSuccess(result, 50);
});

runner.test('Number: Max validation fails for high value', () => {
  const validator = Schema.number().max(10);
  const result = validator.validate(20);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be at most 10');
});

runner.test('Number: Integer validation passes for integer', () => {
  const validator = Schema.number().integer();
  const result = validator.validate(42);
  runner.assertValidationSuccess(result, 42);
});

runner.test('Number: Integer validation fails for decimal', () => {
  const validator = Schema.number().integer();
  const result = validator.validate(3.14);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be an integer');
});

runner.test('Number: Positive validation passes for positive number', () => {
  const validator = Schema.number().positive();
  const result = validator.validate(5);
  runner.assertValidationSuccess(result, 5);
});

runner.test('Number: Positive validation fails for zero', () => {
  const validator = Schema.number().positive();
  const result = validator.validate(0);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be positive');
});

runner.test('Number: Positive validation fails for negative', () => {
  const validator = Schema.number().positive();
  const result = validator.validate(-5);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be positive');
});

runner.test('Number: Range validation (0-100)', () => {
  const validator = Schema.number().min(0).max(100);
  runner.assertValidationSuccess(validator.validate(50), 50);
  runner.assertValidationSuccess(validator.validate(0), 0);
  runner.assertValidationSuccess(validator.validate(100), 100);
  runner.assertValidationFailure(validator.validate(-1));
  runner.assertValidationFailure(validator.validate(101));
});

// ============================================================================
// BOOLEAN VALIDATION TESTS
// ============================================================================

runner.test('Boolean: True passes validation', () => {
  const validator = Schema.boolean();
  const result = validator.validate(true);
  runner.assertValidationSuccess(result, true);
});

runner.test('Boolean: False passes validation', () => {
  const validator = Schema.boolean();
  const result = validator.validate(false);
  runner.assertValidationSuccess(result, false);
});

runner.test('Boolean: String "true" fails validation', () => {
  const validator = Schema.boolean();
  const result = validator.validate('true');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a boolean');
});

runner.test('Boolean: Number 1 fails validation', () => {
  const validator = Schema.boolean();
  const result = validator.validate(1);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a boolean');
});

// ============================================================================
// DATE VALIDATION TESTS
// ============================================================================

runner.test('Date: Valid Date object passes validation', () => {
  const validator = Schema.date();
  const date = new Date('2023-01-01');
  const result = validator.validate(date);
  runner.assertValidationSuccess(result);
  runner.assertTrue(result.value instanceof Date);
});

runner.test('Date: Valid date string passes validation', () => {
  const validator = Schema.date();
  const result = validator.validate('2023-01-01');
  runner.assertValidationSuccess(result);
  runner.assertTrue(result.value instanceof Date);
});

runner.test('Date: Valid timestamp passes validation', () => {
  const validator = Schema.date();
  const timestamp = Date.now();
  const result = validator.validate(timestamp);
  runner.assertValidationSuccess(result);
  runner.assertTrue(result.value instanceof Date);
});

runner.test('Date: Invalid date string fails validation', () => {
  const validator = Schema.date();
  const result = validator.validate('invalid-date');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a valid date');
});

runner.test('Date: Non-date value fails validation', () => {
  const validator = Schema.date();
  const result = validator.validate(true);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a valid date');
});

runner.test('Date: Min date validation passes', () => {
  const validator = Schema.date().min('2020-01-01');
  const result = validator.validate('2023-01-01');
  runner.assertValidationSuccess(result);
});

runner.test('Date: Min date validation fails', () => {
  const validator = Schema.date().min('2020-01-01');
  const result = validator.validate('2019-01-01');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Date must be after');
});

runner.test('Date: Max date validation passes', () => {
  const validator = Schema.date().max('2025-01-01');
  const result = validator.validate('2023-01-01');
  runner.assertValidationSuccess(result);
});

runner.test('Date: Max date validation fails', () => {
  const validator = Schema.date().max('2020-01-01');
  const result = validator.validate('2023-01-01');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Date must be before');
});

// ============================================================================
// ARRAY VALIDATION TESTS
// ============================================================================

runner.test('Array: Valid array passes validation', () => {
  const validator = Schema.array(Schema.string());
  const result = validator.validate(['a', 'b', 'c']);
  runner.assertValidationSuccess(result);
  runner.assertArrayEqual(result.value, ['a', 'b', 'c']);
});

runner.test('Array: Non-array value fails validation', () => {
  const validator = Schema.array(Schema.string());
  const result = validator.validate('not an array');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be an array');
});

runner.test('Array: Min items validation passes', () => {
  const validator = Schema.array(Schema.string()).min(2);
  const result = validator.validate(['a', 'b', 'c']);
  runner.assertValidationSuccess(result);
});

runner.test('Array: Min items validation fails', () => {
  const validator = Schema.array(Schema.string()).min(3);
  const result = validator.validate(['a', 'b']);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must have at least 3 items');
});

runner.test('Array: Max items validation passes', () => {
  const validator = Schema.array(Schema.string()).max(5);
  const result = validator.validate(['a', 'b', 'c']);
  runner.assertValidationSuccess(result);
});

runner.test('Array: Max items validation fails', () => {
  const validator = Schema.array(Schema.string()).max(2);
  const result = validator.validate(['a', 'b', 'c']);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must have at most 2 items');
});

runner.test('Array: Unique items validation passes', () => {
  const validator = Schema.array(Schema.string()).unique();
  const result = validator.validate(['a', 'b', 'c']);
  runner.assertValidationSuccess(result);
});

runner.test('Array: Unique items validation fails', () => {
  const validator = Schema.array(Schema.string()).unique();
  const result = validator.validate(['a', 'b', 'a']);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Duplicate items found at indices: 2');
});

runner.test('Array: Item validation passes for all valid items', () => {
  const validator = Schema.array(Schema.number().min(0));
  const result = validator.validate([1, 2, 3]);
  runner.assertValidationSuccess(result);
});

runner.test('Array: Item validation fails for invalid items', () => {
  const validator = Schema.array(Schema.number().min(0));
  const result = validator.validate([1, -2, 3]);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be at least 0 at [1]');
});

runner.test('Array: Multiple item validation failures', () => {
  const validator = Schema.array(Schema.string().minLength(2));
  const result = validator.validate(['ab', 'a', 'cd', 'e']);
  runner.assertValidationFailure(result, 2);
  runner.assertContains(result.errors[0], 'Must be at least 2 characters long at [1]');
  runner.assertContains(result.errors[1], 'Must be at least 2 characters long at [3]');
});

runner.test('Array: Complex nested validation', () => {
  const validator = Schema.array(
    Schema.object({
      name: Schema.string().minLength(1),
      age: Schema.number().min(0)
    })
  );
  const result = validator.validate([
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ]);
  runner.assertValidationSuccess(result);
});

// ============================================================================
// OBJECT VALIDATION TESTS
// ============================================================================

runner.test('Object: Valid object passes validation', () => {
  const validator = Schema.object({
    name: Schema.string(),
    age: Schema.number()
  });
  const result = validator.validate({ name: 'John', age: 30 });
  runner.assertValidationSuccess(result);
  runner.assertEqual(result.value.name, 'John');
  runner.assertEqual(result.value.age, 30);
});

runner.test('Object: Non-object value fails validation', () => {
  const validator = Schema.object({});
  const result = validator.validate('not an object');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be an object');
});

runner.test('Object: Null value fails validation', () => {
  const validator = Schema.object({});
  const result = validator.validate(null);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be an object');
});

runner.test('Object: Array fails validation', () => {
  const validator = Schema.object({});
  const result = validator.validate([]);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be an object');
});

runner.test('Object: Field validation passes', () => {
  const validator = Schema.object({
    email: Schema.string().email()
  });
  const result = validator.validate({ email: 'test@example.com' });
  runner.assertValidationSuccess(result);
});

runner.test('Object: Field validation fails', () => {
  const validator = Schema.object({
    email: Schema.string().email()
  });
  const result = validator.validate({ email: 'invalid-email' });
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a valid email address');
});

runner.test('Object: Multiple field validation failures', () => {
  const validator = Schema.object({
    name: Schema.string().minLength(2),
    age: Schema.number().min(0)
  });
  const result = validator.validate({ name: 'J', age: -5 });
  runner.assertValidationFailure(result, 2);
  runner.assertContains(result.errors[0], 'Must be at least 2 characters long at name');
  runner.assertContains(result.errors[1], 'Must be at least 0 at age');
});

runner.test('Object: Strict mode rejects unknown fields', () => {
  const validator = Schema.object({
    name: Schema.string()
  }).strict();
  const result = validator.validate({ name: 'John', extra: 'field' });
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Unknown field: extra');
});

runner.test('Object: Passthrough mode allows unknown fields', () => {
  const validator = Schema.object({
    name: Schema.string()
  }).passthrough();
  const result = validator.validate({ name: 'John', extra: 'field' });
  runner.assertValidationSuccess(result);
  runner.assertEqual(result.value.extra, 'field');
});

runner.test('Object: Required fields validation', () => {
  const validator = Schema.object({
    name: Schema.string(),
    email: Schema.string()
  }).required(['name', 'email']);
  const result = validator.validate({ name: 'John' });
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Missing required field: email');
});

runner.test('Object: Nested object validation', () => {
  const validator = Schema.object({
    user: Schema.object({
      name: Schema.string(),
      email: Schema.string().email()
    })
  });
  const result = validator.validate({
    user: { name: 'John', email: 'john@example.com' }
  });
  runner.assertValidationSuccess(result);
});

runner.test('Object: Nested object validation with errors', () => {
  const validator = Schema.object({
    user: Schema.object({
      name: Schema.string(),
      email: Schema.string().email()
    })
  });
  const result = validator.validate({
    user: { name: 'John', email: 'invalid-email' }
  });
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be a valid email address at user.email');
});

// ============================================================================
// UNION TYPE TESTS
// ============================================================================

runner.test('Union: First validator matches', () => {
  const validator = Schema.union(
    Schema.string(),
    Schema.number()
  );
  const result = validator.validate('hello');
  runner.assertValidationSuccess(result, 'hello');
});

runner.test('Union: Second validator matches', () => {
  const validator = Schema.union(
    Schema.string(),
    Schema.number()
  );
  const result = validator.validate(42);
  runner.assertValidationSuccess(result, 42);
});

runner.test('Union: No validator matches', () => {
  const validator = Schema.union(
    Schema.string(),
    Schema.number()
  );
  const result = validator.validate(true);
  runner.assertValidationFailure(result);
  runner.assertContains(result.errors[0], 'Value does not match any of the expected types');
});

runner.test('Union: Complex type union', () => {
  const validator = Schema.union(
    Schema.string().email(),
    Schema.object({ id: Schema.number() })
  );
  
  // Should pass for email
  const emailResult = validator.validate('test@example.com');
  runner.assertValidationSuccess(emailResult, 'test@example.com');
  
  // Should pass for object
  const objectResult = validator.validate({ id: 123 });
  runner.assertValidationSuccess(objectResult);
  
  // Should fail for neither
  const failResult = validator.validate('invalid');
  runner.assertValidationFailure(failResult);
});

// ============================================================================
// LITERAL AND ANY TYPE TESTS
// ============================================================================

runner.test('Literal: Exact match passes', () => {
  const validator = Schema.literal('admin');
  const result = validator.validate('admin');
  runner.assertValidationSuccess(result, 'admin');
});

runner.test('Literal: Non-match fails', () => {
  const validator = Schema.literal('admin');
  const result = validator.validate('user');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Must be exactly: "admin"');
});

runner.test('Any: Accepts any value', () => {
  const validator = Schema.any();
  runner.assertValidationSuccess(validator.validate('string'), 'string');
  runner.assertValidationSuccess(validator.validate(123), 123);
  runner.assertValidationSuccess(validator.validate(true), true);
  runner.assertValidationSuccess(validator.validate(null), null);
  runner.assertValidationSuccess(validator.validate({}), {});
});

// ============================================================================
// OPTIONAL FIELD TESTS
// ============================================================================

runner.test('Optional: Undefined value passes', () => {
  const validator = Schema.string().optional();
  const result = validator.validate(undefined);
  runner.assertValidationSuccess(result, undefined);
});

runner.test('Optional: Null value passes', () => {
  const validator = Schema.string().optional();
  const result = validator.validate(null);
  runner.assertValidationSuccess(result, null);
});

runner.test('Optional: Valid value passes', () => {
  const validator = Schema.string().optional();
  const result = validator.validate('hello');
  runner.assertValidationSuccess(result, 'hello');
});

runner.test('Optional: Invalid value still fails', () => {
  const validator = Schema.string().minLength(5).optional();
  const result = validator.validate('hi');
  runner.assertValidationFailure(result, 1);
});

runner.test('Required: Undefined value fails', () => {
  const validator = Schema.string();
  const result = validator.validate(undefined);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Field is required');
});

runner.test('Required: Null value fails', () => {
  const validator = Schema.string();
  const result = validator.validate(null);
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Field is required');
});

// ============================================================================
// TRANSFORMATION TESTS
// ============================================================================

runner.test('Transform: String transformation', () => {
  const validator = Schema.string().transform(s => s.toUpperCase());
  const result = validator.validate('hello');
  runner.assertValidationSuccess(result, 'HELLO');
});

runner.test('Transform: Number transformation', () => {
  const validator = Schema.number().transform(n => n * 2);
  const result = validator.validate(5);
  runner.assertValidationSuccess(result, 10);
});

runner.test('Transform: Chained transformations', () => {
  const validator = Schema.string()
    .transform(s => s.trim())
    .transform(s => s.toLowerCase());
  const result = validator.validate('  HELLO  ');
  runner.assertValidationSuccess(result, 'hello');
});

runner.test('Transform: Transformation failure', () => {
  const validator = Schema.string().transform(s => {
    throw new Error('Transform error');
  });
  const result = validator.validate('hello');
  runner.assertValidationFailure(result, 1);
  runner.assertContains(result.errors[0], 'Transformation failed: Transform error');
});

runner.test('Transform: Only applied after successful validation', () => {
  const validator = Schema.string().minLength(5).transform(s => s.toUpperCase());
  const result = validator.validate('hi');
  runner.assertValidationFailure(result, 1);
  runner.assertEqual(result.value, null);
});

// ============================================================================
// CUSTOM ERROR MESSAGE TESTS
// ============================================================================

runner.test('Custom Message: String validator', () => {
  const validator = Schema.string().minLength(5).withMessage('Password too short');
  const result = validator.validate('hi');
  runner.assertValidationFailure(result, 1);
  runner.assertEqual(result.errors[0], 'Password too short');
});

runner.test('Custom Message: Number validator', () => {
  const validator = Schema.number().min(18).withMessage('Must be 18 or older');
  const result = validator.validate(16);
  runner.assertValidationFailure(result, 1);
  runner.assertEqual(result.errors[0], 'Must be 18 or older');
});

runner.test('Custom Message: Object field', () => {
  const validator = Schema.object({
    age: Schema.number().min(18).withMessage('Age must be 18+')
  });
  const result = validator.validate({ age: 16 });
  runner.assertValidationFailure(result, 1);
  runner.assertEqual(result.errors[0], 'Age must be 18+');
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

runner.test('Edge Case: Empty string', () => {
  const validator = Schema.string();
  const result = validator.validate('');
  runner.assertValidationSuccess(result, '');
});

runner.test('Edge Case: Zero value', () => {
  const validator = Schema.number();
  const result = validator.validate(0);
  runner.assertValidationSuccess(result, 0);
});

runner.test('Edge Case: Empty array', () => {
  const validator = Schema.array(Schema.string());
  const result = validator.validate([]);
  runner.assertValidationSuccess(result, []);
});

runner.test('Edge Case: Empty object', () => {
  const validator = Schema.object({});
  const result = validator.validate({});
  runner.assertValidationSuccess(result, {});
});

runner.test('Edge Case: Very long string', () => {
  const validator = Schema.string().maxLength(1000);
  const longString = 'a'.repeat(500);
  const result = validator.validate(longString);
  runner.assertValidationSuccess(result, longString);
});

runner.test('Edge Case: Very large number', () => {
  const validator = Schema.number();
  const result = validator.validate(Number.MAX_SAFE_INTEGER);
  runner.assertValidationSuccess(result, Number.MAX_SAFE_INTEGER);
});

runner.test('Edge Case: Very small number', () => {
  const validator = Schema.number();
  const result = validator.validate(Number.MIN_SAFE_INTEGER);
  runner.assertValidationSuccess(result, Number.MIN_SAFE_INTEGER);
});

runner.test('Edge Case: Deeply nested object', () => {
  const validator = Schema.object({
    level1: Schema.object({
      level2: Schema.object({
        level3: Schema.string()
      })
    })
  });
  const result = validator.validate({
    level1: {
      level2: {
        level3: 'deep'
      }
    }
  });
  runner.assertValidationSuccess(result);
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

runner.test('Performance: Large array validation', () => {
  const validator = Schema.array(Schema.string());
  const largeArray = Array(1000).fill('test');
  
  const start = Date.now();
  const result = validator.validate(largeArray);
  const duration = Date.now() - start;
  
  runner.assertValidationSuccess(result);
  runner.assertTrue(duration < 100, `Should complete in under 100ms, took ${duration}ms`);
});

runner.test('Performance: Complex object validation', () => {
  const validator = Schema.object({
    users: Schema.array(Schema.object({
      name: Schema.string().minLength(1),
      email: Schema.string().email(),
      age: Schema.number().min(0).max(150),
      address: Schema.object({
        street: Schema.string(),
        city: Schema.string(),
        zipCode: Schema.string().pattern(/^\d{5}$/)
      })
    }))
  });
  
  const complexObject = {
    users: Array(100).fill(null).map((_, i) => ({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 50),
      address: {
        street: `${i} Main St`,
        city: 'Testville',
        zipCode: '12345'
      }
    }))
  };
  
  const start = Date.now();
  const result = validator.validate(complexObject);
  const duration = Date.now() - start;
  
  runner.assertValidationSuccess(result);
  runner.assertTrue(duration < 200, `Should complete in under 200ms, took ${duration}ms`);
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

runner.test('Integration: User registration schema', () => {
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
    password: 'securepass123',
    confirmPassword: 'securepass123',
    age: 25,
    terms: true,
    newsletter: false
  };
  
  const result = registrationSchema.validate(validData);
  runner.assertValidationSuccess(result);
  runner.assertEqual(result.value.username, 'johndoe123'); // Transformed
});

runner.test('Integration: API request validation', () => {
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
    body: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    timestamp: new Date(Date.now() - 1000) // 1 second ago
  };
  
  const result = apiSchema.validate(validRequest);
  runner.assertValidationSuccess(result);
});

runner.test('Integration: E-commerce product schema', () => {
  const productSchema = Schema.object({
    id: Schema.string().pattern(/^prod_[a-zA-Z0-9]+$/),
    name: Schema.string().minLength(1).maxLength(100),
    description: Schema.string().minLength(10).maxLength(1000),
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
    })).optional(),
    metadata: Schema.object({}).passthrough().optional()
  });
  
  const validProduct = {
    id: 'prod_abc123',
    name: 'Premium T-Shirt',
    description: 'High-quality cotton t-shirt with premium fabric and comfortable fit.',
    price: 29.99,
    currency: 'USD',
    category: 'clothing',
    tags: ['cotton', 'premium', 'comfortable'],
    inStock: true,
    variants: [
      { sku: 'tshirt-red-m', size: 'M', color: 'red' },
      { sku: 'tshirt-blue-l', size: 'L', color: 'blue', price: 31.99 }
    ],
    metadata: {
      supplier: 'Cotton Co',
      origin: 'USA'
    }
  };
  
  const result = productSchema.validate(validProduct);
  runner.assertValidationSuccess(result);
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

console.log('🧪 JavaScript Validation Library - Comprehensive Test Suite\n');
console.log('Testing all validation scenarios, edge cases, and error conditions...\n');

runner.run().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! The validation library is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please review the failures above.');
    process.exit(1);
  }
}); 