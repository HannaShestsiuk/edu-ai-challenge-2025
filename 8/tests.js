/**
 * Comprehensive Test Suite for JavaScript Validation Library
 * 
 * Tests all validation scenarios, edge cases, and error conditions
 */

'use strict';

const { 
  Schema, 
  ValidationResult
} = require('./schema.js');

// Test framework
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

  assertContains(text, substring, message = '') {
    if (!text.includes(substring)) {
      throw new Error(`Text "${text}" does not contain "${substring}". ${message}`);
    }
  }

  assertValidationSuccess(result, expectedValue = undefined) {
    this.assertTrue(result.isValid, 'Validation should succeed');
    this.assertEqual(result.errors.length, 0, 'Should have no errors');
    if (expectedValue !== undefined) {
      this.assertEqual(result.value, expectedValue, 'Value should match');
    }
  }

  assertValidationFailure(result, expectedErrorCount = undefined) {
    this.assertFalse(result.isValid, 'Validation should fail');
    this.assertTrue(result.errors.length > 0, 'Should have errors');
    if (expectedErrorCount !== undefined) {
      this.assertEqual(result.errors.length, expectedErrorCount, `Should have ${expectedErrorCount} errors`);
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
    return this.failed === 0;
  }
}

const test = new TestRunner();

// ============================================================================
// STRING VALIDATION TESTS
// ============================================================================

test.test('String: Valid string passes', () => {
  const validator = Schema.string();
  const result = validator.validate('hello');
  test.assertValidationSuccess(result, 'hello');
});

test.test('String: Non-string fails', () => {
  const validator = Schema.string();
  const result = validator.validate(123);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be a string');
});

test.test('String: MinLength passes', () => {
  const validator = Schema.string().minLength(3);
  const result = validator.validate('hello');
  test.assertValidationSuccess(result, 'hello');
});

test.test('String: MinLength fails', () => {
  const validator = Schema.string().minLength(5);
  const result = validator.validate('hi');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be at least 5 characters');
});

test.test('String: MaxLength passes', () => {
  const validator = Schema.string().maxLength(10);
  const result = validator.validate('hello');
  test.assertValidationSuccess(result, 'hello');
});

test.test('String: MaxLength fails', () => {
  const validator = Schema.string().maxLength(3);
  const result = validator.validate('hello');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be at most 3 characters');
});

test.test('String: Email passes', () => {
  const validator = Schema.string().email();
  const result = validator.validate('user@example.com');
  test.assertValidationSuccess(result, 'user@example.com');
});

test.test('String: Email fails', () => {
  const validator = Schema.string().email();
  const result = validator.validate('invalid-email');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be a valid email address');
});

test.test('String: Pattern passes', () => {
  const validator = Schema.string().pattern(/^[A-Z]+$/);
  const result = validator.validate('HELLO');
  test.assertValidationSuccess(result, 'HELLO');
});

test.test('String: Pattern fails', () => {
  const validator = Schema.string().pattern(/^[A-Z]+$/);
  const result = validator.validate('hello');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Does not match required pattern');
});

test.test('String: Enum passes', () => {
  const validator = Schema.string().enum(['red', 'green', 'blue']);
  const result = validator.validate('red');
  test.assertValidationSuccess(result, 'red');
});

test.test('String: Enum fails', () => {
  const validator = Schema.string().enum(['red', 'green', 'blue']);
  const result = validator.validate('yellow');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be one of: red, green, blue');
});

test.test('String: Transform works', () => {
  const validator = Schema.string().transform(s => s.toUpperCase());
  const result = validator.validate('hello');
  test.assertValidationSuccess(result, 'HELLO');
});

test.test('String: Custom message', () => {
  const validator = Schema.string().minLength(5).withMessage('Too short');
  const result = validator.validate('hi');
  test.assertValidationFailure(result, 1);
  test.assertEqual(result.errors[0], 'Too short');
});

// ============================================================================
// NUMBER VALIDATION TESTS
// ============================================================================

test.test('Number: Valid number passes', () => {
  const validator = Schema.number();
  const result = validator.validate(42);
  test.assertValidationSuccess(result, 42);
});

test.test('Number: Non-number fails', () => {
  const validator = Schema.number();
  const result = validator.validate('not a number');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be a valid number');
});

test.test('Number: NaN fails', () => {
  const validator = Schema.number();
  const result = validator.validate(NaN);
  test.assertValidationFailure(result, 1);
});

test.test('Number: Min passes', () => {
  const validator = Schema.number().min(0);
  const result = validator.validate(5);
  test.assertValidationSuccess(result, 5);
});

test.test('Number: Min fails', () => {
  const validator = Schema.number().min(10);
  const result = validator.validate(5);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be at least 10');
});

test.test('Number: Max passes', () => {
  const validator = Schema.number().max(100);
  const result = validator.validate(50);
  test.assertValidationSuccess(result, 50);
});

test.test('Number: Max fails', () => {
  const validator = Schema.number().max(10);
  const result = validator.validate(20);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be at most 10');
});

test.test('Number: Integer passes', () => {
  const validator = Schema.number().integer();
  const result = validator.validate(42);
  test.assertValidationSuccess(result, 42);
});

test.test('Number: Integer fails', () => {
  const validator = Schema.number().integer();
  const result = validator.validate(3.14);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be an integer');
});

test.test('Number: Positive passes', () => {
  const validator = Schema.number().positive();
  const result = validator.validate(5);
  test.assertValidationSuccess(result, 5);
});

test.test('Number: Positive fails for zero', () => {
  const validator = Schema.number().positive();
  const result = validator.validate(0);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be positive');
});

test.test('Number: Positive fails for negative', () => {
  const validator = Schema.number().positive();
  const result = validator.validate(-5);
  test.assertValidationFailure(result, 1);
});

// ============================================================================
// BOOLEAN VALIDATION TESTS
// ============================================================================

test.test('Boolean: True passes', () => {
  const validator = Schema.boolean();
  const result = validator.validate(true);
  test.assertValidationSuccess(result, true);
});

test.test('Boolean: False passes', () => {
  const validator = Schema.boolean();
  const result = validator.validate(false);
  test.assertValidationSuccess(result, false);
});

test.test('Boolean: String fails', () => {
  const validator = Schema.boolean();
  const result = validator.validate('true');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be a boolean');
});

// ============================================================================
// DATE VALIDATION TESTS
// ============================================================================

test.test('Date: Valid Date object passes', () => {
  const validator = Schema.date();
  const date = new Date('2023-01-01');
  const result = validator.validate(date);
  test.assertValidationSuccess(result);
  test.assertTrue(result.value instanceof Date);
});

test.test('Date: Valid string passes', () => {
  const validator = Schema.date();
  const result = validator.validate('2023-01-01');
  test.assertValidationSuccess(result);
  test.assertTrue(result.value instanceof Date);
});

test.test('Date: Invalid string fails', () => {
  const validator = Schema.date();
  const result = validator.validate('invalid-date');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be a valid date');
});

test.test('Date: Min date passes', () => {
  const validator = Schema.date().min('2020-01-01');
  const result = validator.validate('2023-01-01');
  test.assertValidationSuccess(result);
});

test.test('Date: Min date fails', () => {
  const validator = Schema.date().min('2020-01-01');
  const result = validator.validate('2019-01-01');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Date must be after');
});

// ============================================================================
// ARRAY VALIDATION TESTS
// ============================================================================

test.test('Array: Valid array passes', () => {
  const validator = Schema.array(Schema.string());
  const result = validator.validate(['a', 'b', 'c']);
  test.assertValidationSuccess(result);
});

test.test('Array: Non-array fails', () => {
  const validator = Schema.array(Schema.string());
  const result = validator.validate('not an array');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be an array');
});

test.test('Array: Min items passes', () => {
  const validator = Schema.array(Schema.string()).min(2);
  const result = validator.validate(['a', 'b', 'c']);
  test.assertValidationSuccess(result);
});

test.test('Array: Min items fails', () => {
  const validator = Schema.array(Schema.string()).min(3);
  const result = validator.validate(['a', 'b']);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must have at least 3 items');
});

test.test('Array: Max items passes', () => {
  const validator = Schema.array(Schema.string()).max(5);
  const result = validator.validate(['a', 'b', 'c']);
  test.assertValidationSuccess(result);
});

test.test('Array: Max items fails', () => {
  const validator = Schema.array(Schema.string()).max(2);
  const result = validator.validate(['a', 'b', 'c']);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must have at most 2 items');
});

test.test('Array: Unique passes', () => {
  const validator = Schema.array(Schema.string()).unique();
  const result = validator.validate(['a', 'b', 'c']);
  test.assertValidationSuccess(result);
});

test.test('Array: Unique fails', () => {
  const validator = Schema.array(Schema.string()).unique();
  const result = validator.validate(['a', 'b', 'a']);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Duplicate items found');
});

test.test('Array: Item validation passes', () => {
  const validator = Schema.array(Schema.number().min(0));
  const result = validator.validate([1, 2, 3]);
  test.assertValidationSuccess(result);
});

test.test('Array: Item validation fails', () => {
  const validator = Schema.array(Schema.number().min(0));
  const result = validator.validate([1, -2, 3]);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be at least 0 at [1]');
});

// ============================================================================
// OBJECT VALIDATION TESTS
// ============================================================================

test.test('Object: Valid object passes', () => {
  const validator = Schema.object({
    name: Schema.string(),
    age: Schema.number()
  });
  const result = validator.validate({ name: 'John', age: 30 });
  test.assertValidationSuccess(result);
});

test.test('Object: Non-object fails', () => {
  const validator = Schema.object({});
  const result = validator.validate('not an object');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be an object');
});

test.test('Object: Field validation fails', () => {
  const validator = Schema.object({
    email: Schema.string().email()
  });
  const result = validator.validate({ email: 'invalid-email' });
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be a valid email address');
});

test.test('Object: Strict mode rejects unknown', () => {
  const validator = Schema.object({
    name: Schema.string()
  }).strict();
  const result = validator.validate({ name: 'John', extra: 'field' });
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Unknown field: extra');
});

test.test('Object: Passthrough allows unknown', () => {
  const validator = Schema.object({
    name: Schema.string()
  }).passthrough();
  const result = validator.validate({ name: 'John', extra: 'field' });
  test.assertValidationSuccess(result);
});

test.test('Object: Required fields', () => {
  const validator = Schema.object({
    name: Schema.string(),
    email: Schema.string()
  }).required(['name', 'email']);
  const result = validator.validate({ name: 'John' });
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Missing required field: email');
});

test.test('Object: Nested validation', () => {
  const validator = Schema.object({
    user: Schema.object({
      name: Schema.string(),
      email: Schema.string().email()
    })
  });
  const result = validator.validate({
    user: { name: 'John', email: 'john@example.com' }
  });
  test.assertValidationSuccess(result);
});

test.test('Object: Nested validation with errors', () => {
  const validator = Schema.object({
    user: Schema.object({
      email: Schema.string().email()
    })
  });
  const result = validator.validate({
    user: { email: 'invalid-email' }
  });
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be a valid email address at user.email');
});

// ============================================================================
// UNION TYPE TESTS
// ============================================================================

test.test('Union: First type matches', () => {
  const validator = Schema.union(Schema.string(), Schema.number());
  const result = validator.validate('hello');
  test.assertValidationSuccess(result, 'hello');
});

test.test('Union: Second type matches', () => {
  const validator = Schema.union(Schema.string(), Schema.number());
  const result = validator.validate(42);
  test.assertValidationSuccess(result, 42);
});

test.test('Union: No type matches', () => {
  const validator = Schema.union(Schema.string(), Schema.number());
  const result = validator.validate(true);
  test.assertValidationFailure(result);
  test.assertContains(result.errors[0], 'Value does not match any of the expected types');
});

// ============================================================================
// OPTIONAL FIELDS TESTS
// ============================================================================

test.test('Optional: Undefined passes', () => {
  const validator = Schema.string().optional();
  const result = validator.validate(undefined);
  test.assertValidationSuccess(result, undefined);
});

test.test('Optional: Null passes', () => {
  const validator = Schema.string().optional();
  const result = validator.validate(null);
  test.assertValidationSuccess(result, null);
});

test.test('Optional: Valid value passes', () => {
  const validator = Schema.string().optional();
  const result = validator.validate('hello');
  test.assertValidationSuccess(result, 'hello');
});

test.test('Required: Undefined fails', () => {
  const validator = Schema.string();
  const result = validator.validate(undefined);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Field is required');
});

test.test('Required: Null fails', () => {
  const validator = Schema.string();
  const result = validator.validate(null);
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Field is required');
});

// ============================================================================
// LITERAL AND ANY TESTS
// ============================================================================

test.test('Literal: Exact match passes', () => {
  const validator = Schema.literal('admin');
  const result = validator.validate('admin');
  test.assertValidationSuccess(result, 'admin');
});

test.test('Literal: Non-match fails', () => {
  const validator = Schema.literal('admin');
  const result = validator.validate('user');
  test.assertValidationFailure(result, 1);
  test.assertContains(result.errors[0], 'Must be exactly: "admin"');
});

test.test('Any: Accepts everything', () => {
  const validator = Schema.any();
  test.assertValidationSuccess(validator.validate('string'), 'string');
  test.assertValidationSuccess(validator.validate(123), 123);
  test.assertValidationSuccess(validator.validate(true), true);
  test.assertValidationSuccess(validator.validate(null), null);
});

// ============================================================================
// COMPLEX INTEGRATION TESTS
// ============================================================================

test.test('Integration: User registration', () => {
  const schema = Schema.object({
    username: Schema.string().minLength(3).maxLength(20),
    email: Schema.string().email(),
    password: Schema.string().minLength(8),
    age: Schema.number().min(13).max(120).integer(),
    terms: Schema.literal(true)
  }).strict();

  const validData = {
    username: 'john123',
    email: 'john@example.com',
    password: 'securepass',
    age: 25,
    terms: true
  };

  const result = schema.validate(validData);
  test.assertValidationSuccess(result);
});

test.test('Integration: Complex nested data', () => {
  const schema = Schema.object({
    users: Schema.array(
      Schema.object({
        name: Schema.string().minLength(1),
        contacts: Schema.array(
          Schema.object({
            type: Schema.string().enum(['email', 'phone']),
            value: Schema.string().minLength(1)
          })
        ).min(1)
      })
    ).min(1)
  });

  const data = {
    users: [
      {
        name: 'John',
        contacts: [
          { type: 'email', value: 'john@example.com' },
          { type: 'phone', value: '555-1234' }
        ]
      }
    ]
  };

  const result = schema.validate(data);
  test.assertValidationSuccess(result);
});

test.test('Integration: Multiple validation failures', () => {
  const schema = Schema.object({
    name: Schema.string().minLength(2),
    email: Schema.string().email(),
    age: Schema.number().min(0)
  }).strict();

  const invalidData = {
    name: 'J',
    email: 'invalid',
    age: -5,
    extra: 'field'
  };

  const result = schema.validate(invalidData);
  test.assertValidationFailure(result, 4);
});

// ============================================================================
// EDGE CASES AND PERFORMANCE
// ============================================================================

test.test('Edge: Empty string', () => {
  const validator = Schema.string();
  const result = validator.validate('');
  test.assertValidationSuccess(result, '');
});

test.test('Edge: Zero value', () => {
  const validator = Schema.number();
  const result = validator.validate(0);
  test.assertValidationSuccess(result, 0);
});

test.test('Edge: Empty array', () => {
  const validator = Schema.array(Schema.string());
  const result = validator.validate([]);
  test.assertValidationSuccess(result);
});

test.test('Edge: Very long string', () => {
  const validator = Schema.string();
  const longString = 'a'.repeat(1000);
  const result = validator.validate(longString);
  test.assertValidationSuccess(result, longString);
});

test.test('Performance: Large array', () => {
  const validator = Schema.array(Schema.string());
  const largeArray = Array(1000).fill('test');
  
  const start = Date.now();
  const result = validator.validate(largeArray);
  const duration = Date.now() - start;
  
  test.assertValidationSuccess(result);
  test.assertTrue(duration < 100, `Should be fast, took ${duration}ms`);
});

// ============================================================================
// RUN TESTS
// ============================================================================

console.log('🧪 JavaScript Validation Library - Comprehensive Test Suite');
console.log('='.repeat(60));

test.run().then(success => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ String validation');
    console.log('✅ Number validation');
    console.log('✅ Boolean validation');
    console.log('✅ Date validation');
    console.log('✅ Array validation');
    console.log('✅ Object validation');
    console.log('✅ Union types');
    console.log('✅ Optional fields');
    console.log('✅ Literal and Any types');
    console.log('✅ Complex integrations');
    console.log('✅ Edge cases');
    console.log('✅ Performance tests');
    console.log('\nThe validation library is production-ready! 🚀');
  } else {
    console.log('❌ Some tests failed. Check the output above.');
    process.exit(1);
  }
  console.log('=' .repeat(60));
}); 