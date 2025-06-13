/**
 * Standalone Examples for the Validation Library
 * 
 * This file demonstrates the key features of the validation library
 * with a minimal, self-contained implementation for clarity.
 */

'use strict';

console.log('=== Validation Library Key Features Demo ===\n');

// Simplified core classes for demonstration
class ValidationResult {
  constructor(isValid = true, errors = [], value = null) {
    this.isValid = isValid;
    this.errors = errors;
    this.value = value;
  }

  static success(value) {
    return new ValidationResult(true, [], value);
  }

  static failure(errors) {
    return new ValidationResult(false, Array.isArray(errors) ? errors : [errors]);
  }
}

class BaseValidator {
  constructor() {
    this.isOptionalField = false;
    this.customMessage = null;
    this.transformFn = null;
  }

  optional() {
    this.isOptionalField = true;
    return this;
  }

  withMessage(message) {
    this.customMessage = message;
    return this;
  }

  transform(fn) {
    this.transformFn = fn;
    return this;
  }

  validate(value, path = '') {
    if (value === undefined || value === null) {
      if (this.isOptionalField) {
        return ValidationResult.success(value);
      }
      return ValidationResult.failure(this._formatError('Field is required', path));
    }

    const result = this._validate(value, path);
    
    if (result.isValid && this.transformFn) {
      try {
        result.value = this.transformFn(result.value);
      } catch (error) {
        return ValidationResult.failure(this._formatError(`Transformation failed: ${error.message}`, path));
      }
    }

    return result;
  }

  _formatError(message, path) {
    const location = path ? ` at ${path}` : '';
    return this.customMessage || `${message}${location}`;
  }
}

class StringValidator extends BaseValidator {
  constructor() {
    super();
    this.minLen = null;
    this.maxLen = null;
    this.patternRegex = null;
    this.enumValues = null;
  }

  minLength(min) {
    this.minLen = min;
    return this;
  }

  maxLength(max) {
    this.maxLen = max;
    return this;
  }

  pattern(regex) {
    this.patternRegex = regex;
    return this;
  }

  enum(values) {
    this.enumValues = values;
    return this;
  }

  email() {
    this.patternRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.withMessage('Must be a valid email address');
  }

  _validate(value, path) {
    if (typeof value !== 'string') {
      return ValidationResult.failure(this._formatError('Must be a string', path));
    }

    const errors = [];

    if (this.minLen !== null && value.length < this.minLen) {
      errors.push(this._formatError(`Must be at least ${this.minLen} characters long`, path));
    }

    if (this.maxLen !== null && value.length > this.maxLen) {
      errors.push(this._formatError(`Must be at most ${this.maxLen} characters long`, path));
    }

    if (this.patternRegex && !this.patternRegex.test(value)) {
      errors.push(this._formatError('Does not match required pattern', path));
    }

    if (this.enumValues && !this.enumValues.includes(value)) {
      errors.push(this._formatError(`Must be one of: ${this.enumValues.join(', ')}`, path));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success(value);
  }
}

class NumberValidator extends BaseValidator {
  constructor() {
    super();
    this.minVal = null;
    this.maxVal = null;
    this.isIntegerOnly = false;
  }

  min(min) {
    this.minVal = min;
    return this;
  }

  max(max) {
    this.maxVal = max;
    return this;
  }

  integer() {
    this.isIntegerOnly = true;
    return this;
  }

  _validate(value, path) {
    if (typeof value !== 'number' || isNaN(value)) {
      return ValidationResult.failure(this._formatError('Must be a valid number', path));
    }

    const errors = [];

    if (this.minVal !== null && value < this.minVal) {
      errors.push(this._formatError(`Must be at least ${this.minVal}`, path));
    }

    if (this.maxVal !== null && value > this.maxVal) {
      errors.push(this._formatError(`Must be at most ${this.maxVal}`, path));
    }

    if (this.isIntegerOnly && !Number.isInteger(value)) {
      errors.push(this._formatError('Must be an integer', path));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success(value);
  }
}

class ObjectValidator extends BaseValidator {
  constructor(schema = {}) {
    super();
    this.schema = schema;
    this.allowUnknownKeys = false;
  }

  strict() {
    this.allowUnknownKeys = false;
    return this;
  }

  _validate(value, path) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return ValidationResult.failure(this._formatError('Must be an object', path));
    }

    const errors = [];
    const validatedObject = {};

    for (const [key, validator] of Object.entries(this.schema)) {
      const fieldPath = path ? `${path}.${key}` : key;
      const fieldResult = validator.validate(value[key], fieldPath);
      
      if (!fieldResult.isValid) {
        errors.push(...fieldResult.errors);
      } else if (fieldResult.value !== undefined) {
        validatedObject[key] = fieldResult.value;
      }
    }

    for (const key of Object.keys(value)) {
      if (!(key in this.schema)) {
        if (!this.allowUnknownKeys) {
          errors.push(this._formatError(`Unknown field: ${key}`, path));
        } else {
          validatedObject[key] = value[key];
        }
      }
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success(validatedObject);
  }
}

// Schema factory
class Schema {
  static string() {
    return new StringValidator();
  }
  
  static number() {
    return new NumberValidator();
  }
  
  static object(schema = {}) {
    return new ObjectValidator(schema);
  }
}

// ============================================================================
// DEMONSTRATION EXAMPLES
// ============================================================================

console.log('1. Basic String Validation:');
const emailValidator = Schema.string().email().minLength(5);
console.log('✓ Valid email:', emailValidator.validate('user@example.com').isValid);
console.log('✗ Invalid email:', emailValidator.validate('invalid').isValid);

console.log('\n2. Number Validation:');
const ageValidator = Schema.number().min(0).max(150).integer();
console.log('✓ Valid age (25):', ageValidator.validate(25).isValid);
console.log('✗ Invalid age (-5):', ageValidator.validate(-5).isValid);

console.log('\n3. Data Transformation:');
const nameValidator = Schema.string()
  .minLength(2)
  .transform(value => value.trim().toLowerCase());

const nameResult = nameValidator.validate('  JOHN DOE  ');
console.log('✓ Transformed name:', nameResult.value);

console.log('\n4. Object Validation:');
const userSchema = Schema.object({
  name: Schema.string().minLength(1),
  email: Schema.string().email(),
  age: Schema.number().min(0).optional()
}).strict();

const validUser = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
};

const invalidUser = {
  name: '',           // Invalid: empty
  email: 'invalid',   // Invalid: bad format
  age: -5,           // Invalid: negative
  extra: 'field'     // Invalid: unknown field in strict mode
};

console.log('✓ Valid user:', userSchema.validate(validUser).isValid);
const invalidResult = userSchema.validate(invalidUser);
console.log('✗ Invalid user errors:');
invalidResult.errors.forEach((error, index) => {
  console.log(`  ${index + 1}. ${error}`);
});

console.log('\n5. Optional Fields:');
const profileSchema = Schema.object({
  name: Schema.string().minLength(1),
  bio: Schema.string().optional()
});

console.log('✓ With optional field:', profileSchema.validate({ name: 'John', bio: 'Developer' }).isValid);
console.log('✓ Without optional field:', profileSchema.validate({ name: 'John' }).isValid);

console.log('\n6. Custom Error Messages:');
const passwordValidator = Schema.string()
  .minLength(8)
  .withMessage('Password must be at least 8 characters long');

const passwordResult = passwordValidator.validate('123');
console.log('✗ Custom error:', passwordResult.errors[0]);

console.log('\n7. Method Chaining:');
const complexValidator = Schema.string()
  .minLength(3)
  .maxLength(20)
  .pattern(/^[a-zA-Z0-9_]+$/)
  .transform(value => value.toLowerCase())
  .withMessage('Username must be 3-20 alphanumeric characters');

console.log('✓ Complex validation:', complexValidator.validate('User_123').isValid);
console.log('✓ Transformed value:', complexValidator.validate('User_123').value);

console.log('\n=== Demo Complete ===');
console.log('\nFeatures Demonstrated:');
console.log('• String validation with patterns and constraints');
console.log('• Number validation with ranges and type checking');
console.log('• Object validation with nested schemas');
console.log('• Optional field handling');
console.log('• Data transformation after validation');
console.log('• Custom error messages');
console.log('• Method chaining for fluent API');
console.log('• Strict mode for object validation');
console.log('• Detailed error reporting with field paths'); 