/**
 * Comprehensive Examples for the Validation Library
 * 
 * This file demonstrates various usage patterns, advanced features,
 * and real-world scenarios for the validation library.
 */

'use strict';

// Import the validation library (excluding demo)
const { 
  Schema, 
  ValidationResult, 
  StringValidator, 
  NumberValidator,
  ObjectValidator 
} = require('./schema.js');

console.log('=== Comprehensive Validation Library Examples ===\n');

// ============================================================================
// BASIC VALIDATION EXAMPLES
// ============================================================================

console.log('1. Basic String Validation:');
const emailValidator = Schema.string().email().minLength(5);
console.log('✓ Valid email:', emailValidator.validate('user@example.com').isValid);
console.log('✗ Invalid email:', emailValidator.validate('invalid').isValid);

console.log('\n2. Number Validation with Constraints:');
const ageValidator = Schema.number().min(0).max(150).integer();
console.log('✓ Valid age (25):', ageValidator.validate(25).isValid);
console.log('✗ Invalid age (-5):', ageValidator.validate(-5).isValid);
console.log('✗ Invalid age (25.5):', ageValidator.validate(25.5).isValid);

// ============================================================================
// ADVANCED VALIDATION EXAMPLES
// ============================================================================

console.log('\n3. Custom Transformations:');
const nameValidator = Schema.string()
  .minLength(2)
  .transform(value => value.trim().toLowerCase())
  .withMessage('Name must be at least 2 characters');

const nameResult = nameValidator.validate('  JOHN DOE  ');
console.log('✓ Transformed name:', nameResult.value);

console.log('\n4. Array Validation with Unique Constraints:');
const tagsValidator = Schema.array(Schema.string().minLength(1))
  .min(1)
  .max(5)
  .unique();

console.log('✓ Valid tags:', tagsValidator.validate(['javascript', 'node', 'react']).isValid);
console.log('✗ Invalid tags (duplicates):', tagsValidator.validate(['js', 'js', 'react']).isValid);

console.log('\n5. Union Type Validation:');
const flexibleIdValidator = Schema.union(
  Schema.string().minLength(1),
  Schema.number().positive()
);

console.log('✓ String ID:', flexibleIdValidator.validate('user123').isValid);
console.log('✓ Numeric ID:', flexibleIdValidator.validate(42).isValid);
console.log('✗ Invalid ID (null):', flexibleIdValidator.validate(null).isValid);

// ============================================================================
// COMPLEX OBJECT VALIDATION
// ============================================================================

console.log('\n6. Complex Nested Object Validation:');

// Define reusable schemas
const addressSchema = Schema.object({
  street: Schema.string().minLength(1),
  city: Schema.string().minLength(1),
  state: Schema.string().pattern(/^[A-Z]{2}$/),
  zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
  country: Schema.string().enum(['US', 'CA', 'MX']).optional()
});

const userProfileSchema = Schema.object({
  id: Schema.union(Schema.string(), Schema.number()),
  username: Schema.string().minLength(3).maxLength(20).pattern(/^[a-zA-Z0-9_]+$/),
  email: Schema.string().email(),
  firstName: Schema.string().minLength(1).optional(),
  lastName: Schema.string().minLength(1).optional(),
  age: Schema.number().min(13).max(120).integer().optional(),
  address: addressSchema.optional(),
  preferences: Schema.object({
    theme: Schema.string().enum(['light', 'dark']).optional(),
    notifications: Schema.boolean().optional()
  }).passthrough().optional(),
  createdAt: Schema.date().max(new Date()),
  tags: Schema.array(Schema.string()).unique().optional(),
  role: Schema.literal('user')
}).strict();

// Test complex validation
const validProfile = {
  id: 'user123',
  username: 'john_doe',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345-6789'
  },
  preferences: {
    theme: 'dark',
    notifications: true,
    customSetting: 'value' // Passes through in passthrough mode
  },
  createdAt: '2023-01-15T10:30:00Z',
  tags: ['developer', 'javascript', 'nodejs'],
  role: 'user'
};

const profileResult = userProfileSchema.validate(validProfile);
console.log('✓ Complex validation passed:', profileResult.isValid);

// ============================================================================
// ERROR HANDLING EXAMPLES
// ============================================================================

console.log('\n7. Detailed Error Reporting:');

const invalidProfile = {
  id: '', // Invalid: empty string
  username: 'a', // Invalid: too short
  email: 'not-an-email', // Invalid: bad format
  age: -5, // Invalid: negative
  address: {
    street: '', // Invalid: empty
    city: 'Test City',
    state: 'California', // Invalid: not 2 letters
    zipCode: '123' // Invalid: wrong format
  },
  createdAt: '2099-01-01', // Invalid: future date
  tags: ['js', 'node', 'js'], // Invalid: duplicates
  role: 'admin', // Invalid: not 'user'
  unknownField: 'test' // Invalid: unknown field in strict mode
};

const invalidResult = userProfileSchema.validate(invalidProfile);
console.log('✗ Validation failed with', invalidResult.errors.length, 'errors:');
invalidResult.errors.slice(0, 5).forEach((error, index) => {
  console.log(`  ${index + 1}. ${error}`);
});
if (invalidResult.errors.length > 5) {
  console.log(`  ... and ${invalidResult.errors.length - 5} more errors`);
}

// ============================================================================
// CUSTOM VALIDATOR EXAMPLE
// ============================================================================

console.log('\n8. Custom Password Validator:');

// Extend StringValidator for password validation
class PasswordValidator extends StringValidator {
  constructor() {
    super();
    this.minLen = 8;
    this.requireUppercase = false;
    this.requireNumbers = false;
    this.requireSpecial = false;
  }

  uppercase() {
    this.requireUppercase = true;
    return this;
  }

  numbers() {
    this.requireNumbers = true;
    return this;
  }

  special() {
    this.requireSpecial = true;
    return this;
  }

  _validate(value, path) {
    // First run standard string validation
    const baseResult = super._validate(value, path);
    if (!baseResult.isValid) {
      return baseResult;
    }

    const errors = [];

    if (this.requireUppercase && !/[A-Z]/.test(value)) {
      errors.push(this._formatError('Must contain uppercase letter', path));
    }

    if (this.requireNumbers && !/\d/.test(value)) {
      errors.push(this._formatError('Must contain number', path));
    }

    if (this.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push(this._formatError('Must contain special character', path));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success(value);
  }
}

const passwordValidator = new PasswordValidator()
  .minLength(8)
  .uppercase()
  .numbers()
  .special();

console.log('✓ Strong password valid:', passwordValidator.validate('MyP@ssw0rd123').isValid);
console.log('✗ Weak password valid:', passwordValidator.validate('password').isValid);

// ============================================================================
// REAL-WORLD API VALIDATION EXAMPLE
// ============================================================================

console.log('\n9. Real-World API Validation:');

const apiRequestSchema = Schema.object({
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
    'authorization': 'Bearer abc123',
    'user-agent': 'MyApp/1.0'
  },
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  timestamp: new Date()
};

console.log('✓ API request valid:', apiRequestSchema.validate(validRequest).isValid);

console.log('\n=== Examples Complete ==='); 