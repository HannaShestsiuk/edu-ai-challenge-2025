/**
 * Robust Validation Library for JavaScript
 * 
 * A comprehensive, type-safe validation library that supports both primitive 
 * and complex data types with method chaining and detailed error reporting.
 * 
 * @author Validation Library Team
 * @version 1.0.0
 * @example
 * // Basic usage
 * const { Schema } = require('./schema.js');
 * const validator = Schema.string().minLength(2).email();
 * const result = validator.validate('user@example.com');
 */

'use strict';

// ============================================================================
// VALIDATION RESULT CLASSES
// ============================================================================

/**
 * Represents the result of a validation operation.
 * Contains validation status, error messages, and the validated value.
 * 
 * @class ValidationResult
 * @example
 * const result = ValidationResult.success("valid data");
 * if (result.isValid) {
 *   console.log("Validation passed:", result.value);
 * }
 */
class ValidationResult {
  /**
   * Creates a new ValidationResult instance.
   * 
   * @param {boolean} [isValid=true] - Whether the validation passed
   * @param {string[]} [errors=[]] - Array of error messages
   * @param {*} [value=null] - The validated value
   */
  constructor(isValid = true, errors = [], value = null) {
    /** @type {boolean} Whether the validation was successful */
    this.isValid = isValid;
    
    /** @type {string[]} Array of validation error messages */
    this.errors = errors;
    
    /** @type {*} The validated and potentially transformed value */
    this.value = value;
  }

  /**
   * Creates a successful validation result.
   * 
   * @param {*} value - The validated value
   * @returns {ValidationResult} Success result
   * @static
   * @example
   * const result = ValidationResult.success("Hello World");
   */
  static success(value) {
    return new ValidationResult(true, [], value);
  }

  /**
   * Creates a failed validation result.
   * 
   * @param {string|string[]} errors - Error message(s)
   * @param {*} [value=null] - The original value that failed validation
   * @returns {ValidationResult} Failure result
   * @static
   * @example
   * const result = ValidationResult.failure("Invalid email format");
   */
  static failure(errors, value = null) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    return new ValidationResult(false, errorArray, value);
  }

  /**
   * Adds an error to this validation result and marks it as invalid.
   * 
   * @param {string} error - Error message to add
   * @returns {ValidationResult} This instance for chaining
   * @example
   * result.addError("Additional validation error");
   */
  addError(error) {
    this.errors.push(error);
    this.isValid = false;
    return this;
  }

  /**
   * Merges another validation result into this one.
   * If the other result is invalid, this result becomes invalid too.
   * 
   * @param {ValidationResult} otherResult - Result to merge
   * @returns {ValidationResult} This instance for chaining
   * @example
   * result1.merge(result2);
   */
  merge(otherResult) {
    if (!otherResult.isValid) {
      this.isValid = false;
      this.errors.push(...otherResult.errors);
    }
    return this;
  }
}

// ============================================================================
// BASE VALIDATOR CLASS
// ============================================================================

/**
 * Abstract base class for all validators.
 * Provides common functionality like optional fields, custom messages, and transformations.
 * 
 * @abstract
 * @class BaseValidator
 * @example
 * // This is an abstract class - extend it to create specific validators
 * class CustomValidator extends BaseValidator {
 *   _validate(value, path) {
 *     // Implementation specific validation logic
 *   }
 * }
 */
class BaseValidator {
  /**
   * Creates a new BaseValidator instance.
   * Initializes common validator properties.
   */
  constructor() {
    /** @type {boolean} Whether this field is optional */
    this.isOptionalField = false;
    
    /** @type {string|null} Custom error message */
    this.customMessage = null;
    
    /** @type {Function|null} Transformation function */
    this.transformFn = null;
  }

  /**
   * Marks this validator as optional, allowing null/undefined values.
   * 
   * @returns {BaseValidator} This instance for method chaining
   * @example
   * const validator = Schema.string().minLength(5).optional();
   * validator.validate(null); // { isValid: true, value: null }
   */
  optional() {
    this.isOptionalField = true;
    return this;
  }

  /**
   * Sets a custom error message for this validator.
   * 
   * @param {string} message - Custom error message
   * @returns {BaseValidator} This instance for method chaining
   * @example
   * const validator = Schema.string()
   *   .minLength(5)
   *   .withMessage('Password must be at least 5 characters');
   */
  withMessage(message) {
    this.customMessage = message;
    return this;
  }

  /**
   * Applies a transformation function to the validated value.
   * The transformation is only applied if validation passes.
   * 
   * @param {Function} fn - Transformation function
   * @returns {BaseValidator} This instance for method chaining
   * @example
   * const validator = Schema.string()
   *   .transform(value => value.toLowerCase().trim());
   * validator.validate("  HELLO  "); // { isValid: true, value: "hello" }
   */
  transform(fn) {
    this.transformFn = fn;
    return this;
  }

  /**
   * Validates a value against this validator's rules.
   * Handles optional fields, applies transformations, and formats errors.
   * 
   * @param {*} value - Value to validate
   * @param {string} [path=''] - Field path for error reporting
   * @returns {ValidationResult} Validation result
   * @example
   * const result = validator.validate("test@example.com", "user.email");
   */
  validate(value, path = '') {
    // Handle null/undefined values for optional fields
    if (value === undefined || value === null) {
      if (this.isOptionalField) {
        return ValidationResult.success(value);
      }
      return ValidationResult.failure(this._formatError('Field is required', path));
    }

    // Perform type-specific validation
    const result = this._validate(value, path);
    
    // Apply transformation if validation passed and transform function exists
    if (result.isValid && this.transformFn) {
      try {
        result.value = this.transformFn(result.value);
      } catch (error) {
        return ValidationResult.failure(
          this._formatError(`Transformation failed: ${error.message}`, path)
        );
      }
    }

    return result;
  }

  /**
   * Abstract method that must be implemented by subclasses.
   * Contains the specific validation logic for each validator type.
   * 
   * @abstract
   * @param {*} value - Value to validate
   * @param {string} path - Field path for error reporting
   * @returns {ValidationResult} Validation result
   * @protected
   */
  _validate(value, path) {
    throw new Error('_validate method must be implemented by subclasses');
  }

  /**
   * Formats error messages with field path information.
   * Uses custom message if provided, otherwise uses the default message.
   * 
   * @param {string} message - Default error message
   * @param {string} path - Field path
   * @returns {string} Formatted error message
   * @protected
   * @example
   * this._formatError('Must be a string', 'user.name');
   * // Returns: "Must be a string at user.name" or custom message
   */
  _formatError(message, path) {
    const location = path ? ` at ${path}` : '';
    return this.customMessage || `${message}${location}`;
  }
}

// ============================================================================
// STRING VALIDATOR
// ============================================================================

/**
 * Validator for string values with comprehensive validation rules.
 * Supports length constraints, pattern matching, predefined formats, and enums.
 * 
 * @class StringValidator
 * @extends BaseValidator
 * @example
 * const emailValidator = Schema.string().email().minLength(5);
 * const result = emailValidator.validate('user@example.com');
 */
class StringValidator extends BaseValidator {
  /**
   * Creates a new StringValidator instance.
   * Initializes string-specific validation properties.
   */
  constructor() {
    super();
    
    /** @type {number|null} Minimum string length */
    this.minLen = null;
    
    /** @type {number|null} Maximum string length */
    this.maxLen = null;
    
    /** @type {RegExp|null} Regular expression pattern */
    this.patternRegex = null;
    
    /** @type {string[]|null} Allowed enumeration values */
    this.enumValues = null;
  }

  /**
   * Sets minimum length constraint.
   * 
   * @param {number} min - Minimum length (inclusive)
   * @returns {StringValidator} This instance for method chaining
   * @example
   * Schema.string().minLength(3).validate('hi'); // Invalid: too short
   * Schema.string().minLength(3).validate('hello'); // Valid
   */
  minLength(min) {
    this.minLen = min;
    return this;
  }

  /**
   * Sets maximum length constraint.
   * 
   * @param {number} max - Maximum length (inclusive)
   * @returns {StringValidator} This instance for method chaining
   * @example
   * Schema.string().maxLength(10).validate('hello world'); // Invalid: too long
   * Schema.string().maxLength(10).validate('hello'); // Valid
   */
  maxLength(max) {
    this.maxLen = max;
    return this;
  }

  /**
   * Sets a regular expression pattern that the string must match.
   * 
   * @param {RegExp} regex - Regular expression pattern
   * @returns {StringValidator} This instance for method chaining
   * @example
   * Schema.string().pattern(/^[A-Z]+$/).validate('HELLO'); // Valid
   * Schema.string().pattern(/^[A-Z]+$/).validate('hello'); // Invalid
   */
  pattern(regex) {
    this.patternRegex = regex;
    return this;
  }

  /**
   * Restricts string to one of the specified enumeration values.
   * 
   * @param {string[]} values - Array of allowed values
   * @returns {StringValidator} This instance for method chaining
   * @example
   * Schema.string().enum(['red', 'green', 'blue']).validate('red'); // Valid
   * Schema.string().enum(['red', 'green', 'blue']).validate('yellow'); // Invalid
   */
  enum(values) {
    this.enumValues = values;
    return this;
  }

  /**
   * Validates string as email format using RFC-compliant regex.
   * 
   * @returns {StringValidator} This instance for method chaining
   * @example
   * Schema.string().email().validate('user@example.com'); // Valid
   * Schema.string().email().validate('invalid-email'); // Invalid
   */
  email() {
    this.patternRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.withMessage('Must be a valid email address');
  }

  /**
   * Validates string as URL format (http/https).
   * 
   * @returns {StringValidator} This instance for method chaining
   * @example
   * Schema.string().url().validate('https://example.com'); // Valid
   * Schema.string().url().validate('not-a-url'); // Invalid
   */
  url() {
    this.patternRegex = /^https?:\/\/.+/;
    return this.withMessage('Must be a valid URL');
  }

  /**
   * Performs string-specific validation.
   * 
   * @param {*} value - Value to validate
   * @param {string} path - Field path for error reporting
   * @returns {ValidationResult} Validation result
   * @protected
   */
  _validate(value, path) {
    // Type check
    if (typeof value !== 'string') {
      return ValidationResult.failure(this._formatError('Must be a string', path));
    }

    const errors = [];

    // Length validations
    if (this.minLen !== null && value.length < this.minLen) {
      errors.push(this._formatError(`Must be at least ${this.minLen} characters long`, path));
    }

    if (this.maxLen !== null && value.length > this.maxLen) {
      errors.push(this._formatError(`Must be at most ${this.maxLen} characters long`, path));
    }

    // Pattern validation
    if (this.patternRegex && !this.patternRegex.test(value)) {
      errors.push(this._formatError('Does not match required pattern', path));
    }

    // Enum validation
    if (this.enumValues && !this.enumValues.includes(value)) {
      errors.push(this._formatError(`Must be one of: ${this.enumValues.join(', ')}`, path));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success(value);
  }
}

// ============================================================================
// NUMBER VALIDATOR
// ============================================================================

/**
 * Validator for numeric values with range and type constraints.
 * Supports min/max bounds, integer validation, and positive number validation.
 * 
 * @class NumberValidator
 * @extends BaseValidator
 * @example
 * const ageValidator = Schema.number().min(0).max(150).integer();
 * const result = ageValidator.validate(25);
 */
class NumberValidator extends BaseValidator {
  /**
   * Creates a new NumberValidator instance.
   * Initializes number-specific validation properties.
   */
  constructor() {
    super();
    
    /** @type {number|null} Minimum value (inclusive) */
    this.minVal = null;
    
    /** @type {number|null} Maximum value (inclusive) */
    this.maxVal = null;
    
    /** @type {boolean} Whether value must be an integer */
    this.isIntegerOnly = false;
    
    /** @type {boolean} Whether value must be positive */
    this.isPositiveOnly = false;
  }

  /**
   * Sets minimum value constraint.
   * 
   * @param {number} min - Minimum value (inclusive)
   * @returns {NumberValidator} This instance for method chaining
   * @example
   * Schema.number().min(0).validate(-1); // Invalid: below minimum
   * Schema.number().min(0).validate(5); // Valid
   */
  min(min) {
    this.minVal = min;
    return this;
  }

  /**
   * Sets maximum value constraint.
   * 
   * @param {number} max - Maximum value (inclusive)
   * @returns {NumberValidator} This instance for method chaining
   * @example
   * Schema.number().max(100).validate(150); // Invalid: above maximum
   * Schema.number().max(100).validate(50); // Valid
   */
  max(max) {
    this.maxVal = max;
    return this;
  }

  /**
   * Requires the number to be an integer (no decimal places).
   * 
   * @returns {NumberValidator} This instance for method chaining
   * @example
   * Schema.number().integer().validate(3.14); // Invalid: has decimals
   * Schema.number().integer().validate(42); // Valid
   */
  integer() {
    this.isIntegerOnly = true;
    return this;
  }

  /**
   * Requires the number to be positive (greater than zero).
   * 
   * @returns {NumberValidator} This instance for method chaining
   * @example
   * Schema.number().positive().validate(-5); // Invalid: negative
   * Schema.number().positive().validate(0); // Invalid: zero
   * Schema.number().positive().validate(10); // Valid
   */
  positive() {
    this.isPositiveOnly = true;
    return this;
  }

  /**
   * Performs number-specific validation.
   * 
   * @param {*} value - Value to validate
   * @param {string} path - Field path for error reporting
   * @returns {ValidationResult} Validation result
   * @protected
   */
  _validate(value, path) {
    // Type and NaN check
    if (typeof value !== 'number' || isNaN(value)) {
      return ValidationResult.failure(this._formatError('Must be a valid number', path));
    }

    const errors = [];

    // Range validations
    if (this.minVal !== null && value < this.minVal) {
      errors.push(this._formatError(`Must be at least ${this.minVal}`, path));
    }

    if (this.maxVal !== null && value > this.maxVal) {
      errors.push(this._formatError(`Must be at most ${this.maxVal}`, path));
    }

    // Integer validation
    if (this.isIntegerOnly && !Number.isInteger(value)) {
      errors.push(this._formatError('Must be an integer', path));
    }

    // Positive validation
    if (this.isPositiveOnly && value <= 0) {
      errors.push(this._formatError('Must be positive', path));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success(value);
  }
}

// ============================================================================
// BOOLEAN VALIDATOR
// ============================================================================

/**
 * Validator for boolean values.
 * Performs strict boolean type checking.
 * 
 * @class BooleanValidator
 * @extends BaseValidator
 * @example
 * const validator = Schema.boolean();
 * validator.validate(true); // Valid
 * validator.validate('true'); // Invalid: string, not boolean
 */
class BooleanValidator extends BaseValidator {
  /**
   * Performs boolean-specific validation.
   * 
   * @param {*} value - Value to validate
   * @param {string} path - Field path for error reporting
   * @returns {ValidationResult} Validation result
   * @protected
   */
  _validate(value, path) {
    if (typeof value !== 'boolean') {
      return ValidationResult.failure(this._formatError('Must be a boolean', path));
    }
    return ValidationResult.success(value);
  }
}

// ============================================================================
// DATE VALIDATOR
// ============================================================================

/**
 * Validator for date values with date range constraints.
 * Supports Date objects, date strings, and timestamps with min/max bounds.
 * 
 * @class DateValidator
 * @extends BaseValidator
 * @example
 * const validator = Schema.date().min('2020-01-01').max(new Date());
 * validator.validate('2023-06-15'); // Valid if within range
 */
class DateValidator extends BaseValidator {
  /**
   * Creates a new DateValidator instance.
   * Initializes date-specific validation properties.
   */
  constructor() {
    super();
    
    /** @type {Date|null} Minimum date (inclusive) */
    this.minDate = null;
    
    /** @type {Date|null} Maximum date (inclusive) */
    this.maxDate = null;
  }

  /**
   * Sets minimum date constraint.
   * 
   * @param {Date|string|number} date - Minimum date (inclusive)
   * @returns {DateValidator} This instance for method chaining
   * @example
   * Schema.date().min('2020-01-01').validate('2019-12-31'); // Invalid: too early
   * Schema.date().min('2020-01-01').validate('2020-06-15'); // Valid
   */
  min(date) {
    this.minDate = new Date(date);
    return this;
  }

  /**
   * Sets maximum date constraint.
   * 
   * @param {Date|string|number} date - Maximum date (inclusive)
   * @returns {DateValidator} This instance for method chaining
   * @example
   * Schema.date().max(new Date()).validate('2099-01-01'); // Invalid: future date
   * Schema.date().max(new Date()).validate('2020-01-01'); // Valid if in past
   */
  max(date) {
    this.maxDate = new Date(date);
    return this;
  }

  /**
   * Performs date-specific validation.
   * 
   * @param {*} value - Value to validate (Date, string, or number)
   * @param {string} path - Field path for error reporting
   * @returns {ValidationResult} Validation result
   * @protected
   */
  _validate(value, path) {
    let date;
    
    // Convert value to Date object
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      return ValidationResult.failure(this._formatError('Must be a valid date', path));
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ValidationResult.failure(this._formatError('Must be a valid date', path));
    }

    const errors = [];

    // Date range validations
    if (this.minDate && date < this.minDate) {
      errors.push(this._formatError(`Date must be after ${this.minDate.toISOString()}`, path));
    }

    if (this.maxDate && date > this.maxDate) {
      errors.push(this._formatError(`Date must be before ${this.maxDate.toISOString()}`, path));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success(date);
  }
}

// ============================================================================
// ARRAY VALIDATOR
// ============================================================================

/**
 * Validator for array values with item validation and array constraints.
 * Supports min/max length, unique items, and validation of individual elements.
 * 
 * @class ArrayValidator
 * @extends BaseValidator
 * @example
 * const validator = Schema.array(Schema.string()).min(1).max(5).unique();
 * validator.validate(['a', 'b', 'c']); // Valid: 3 unique strings
 */
class ArrayValidator extends BaseValidator {
  /**
   * Creates a new ArrayValidator instance.
   * 
   * @param {BaseValidator} itemValidator - Validator for array items
   */
  constructor(itemValidator) {
    super();
    
    /** @type {BaseValidator} Validator for individual array items */
    this.itemValidator = itemValidator;
    
    /** @type {number|null} Minimum number of items */
    this.minItems = null;
    
    /** @type {number|null} Maximum number of items */
    this.maxItems = null;
    
    /** @type {boolean} Whether all items must be unique */
    this.uniqueItems = false;
  }

  /**
   * Sets minimum array length constraint.
   * 
   * @param {number} min - Minimum number of items (inclusive)
   * @returns {ArrayValidator} This instance for method chaining
   * @example
   * Schema.array(Schema.string()).min(1).validate([]); // Invalid: empty array
   * Schema.array(Schema.string()).min(1).validate(['a']); // Valid
   */
  min(min) {
    this.minItems = min;
    return this;
  }

  /**
   * Sets maximum array length constraint.
   * 
   * @param {number} max - Maximum number of items (inclusive)
   * @returns {ArrayValidator} This instance for method chaining
   * @example
   * Schema.array(Schema.string()).max(2).validate(['a', 'b', 'c']); // Invalid: too many
   * Schema.array(Schema.string()).max(2).validate(['a', 'b']); // Valid
   */
  max(max) {
    this.maxItems = max;
    return this;
  }

  /**
   * Requires all array items to be unique.
   * Uses JSON serialization for deep equality comparison.
   * 
   * @returns {ArrayValidator} This instance for method chaining
   * @example
   * Schema.array(Schema.string()).unique().validate(['a', 'b', 'a']); // Invalid: duplicate 'a'
   * Schema.array(Schema.string()).unique().validate(['a', 'b', 'c']); // Valid
   */
  unique() {
    this.uniqueItems = true;
    return this;
  }

  /**
   * Performs array-specific validation.
   * 
   * @param {*} value - Value to validate
   * @param {string} path - Field path for error reporting
   * @returns {ValidationResult} Validation result
   * @protected
   */
  _validate(value, path) {
    // Type check
    if (!Array.isArray(value)) {
      return ValidationResult.failure(this._formatError('Must be an array', path));
    }

    const errors = [];

    // Length validations
    if (this.minItems !== null && value.length < this.minItems) {
      errors.push(this._formatError(`Must have at least ${this.minItems} items`, path));
    }

    if (this.maxItems !== null && value.length > this.maxItems) {
      errors.push(this._formatError(`Must have at most ${this.maxItems} items`, path));
    }

    // Uniqueness validation
    if (this.uniqueItems) {
      const seen = new Set();
      const duplicates = [];
      
      value.forEach((item, index) => {
        const serialized = JSON.stringify(item);
        if (seen.has(serialized)) {
          duplicates.push(index);
        } else {
          seen.add(serialized);
        }
      });

      if (duplicates.length > 0) {
        errors.push(this._formatError(`Duplicate items found at indices: ${duplicates.join(', ')}`, path));
      }
    }

    // Validate each array item
    const validatedItems = [];
    value.forEach((item, index) => {
      const itemPath = path ? `${path}[${index}]` : `[${index}]`;
      const itemResult = this.itemValidator.validate(item, itemPath);
      
      if (!itemResult.isValid) {
        errors.push(...itemResult.errors);
      } else {
        validatedItems.push(itemResult.value);
      }
    });

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success(validatedItems);
  }
}

// ============================================================================
// OBJECT VALIDATOR
// ============================================================================

/**
 * Validator for object values with schema-based validation.
 * Supports nested object validation, strict/passthrough modes, and required fields.
 * 
 * @class ObjectValidator
 * @extends BaseValidator
 * @example
 * const validator = Schema.object({
 *   name: Schema.string().minLength(1),
 *   age: Schema.number().min(0).optional()
 * }).strict();
 * validator.validate({ name: 'John', age: 30 }); // Valid
 */
class ObjectValidator extends BaseValidator {
  /**
   * Creates a new ObjectValidator instance.
   * 
   * @param {Object.<string, BaseValidator>} [schema={}] - Object schema mapping field names to validators
   */
  constructor(schema = {}) {
    super();
    
    /** @type {Object.<string, BaseValidator>} Schema definition */
    this.schema = schema;
    
    /** @type {boolean} Whether to allow unknown fields */
    this.allowUnknownKeys = false;
    
    /** @type {Set<string>} Set of required field names */
    this.requiredKeys = new Set();
  }

  /**
   * Enables strict mode - rejects unknown fields not in schema.
   * 
   * @returns {ObjectValidator} This instance for method chaining
   * @example
   * Schema.object({ name: Schema.string() })
   *   .strict()
   *   .validate({ name: 'John', age: 30 }); // Invalid: 'age' not in schema
   */
  strict() {
    this.allowUnknownKeys = false;
    return this;
  }

  /**
   * Enables passthrough mode - allows unknown fields not in schema.
   * 
   * @returns {ObjectValidator} This instance for method chaining
   * @example
   * Schema.object({ name: Schema.string() })
   *   .passthrough()
   *   .validate({ name: 'John', age: 30 }); // Valid: 'age' is passed through
   */
  passthrough() {
    this.allowUnknownKeys = true;
    return this;
  }

  /**
   * Specifies required fields that must be present in the object.
   * 
   * @param {string|string[]} keys - Required field name(s)
   * @returns {ObjectValidator} This instance for method chaining
   * @example
   * Schema.object({ name: Schema.string(), email: Schema.string() })
   *   .required(['name', 'email'])
   *   .validate({ name: 'John' }); // Invalid: missing 'email'
   */
  required(keys) {
    if (Array.isArray(keys)) {
      keys.forEach(key => this.requiredKeys.add(key));
    } else {
      this.requiredKeys.add(keys);
    }
    return this;
  }

  /**
   * Performs object-specific validation.
   * 
   * @param {*} value - Value to validate
   * @param {string} path - Field path for error reporting
   * @returns {ValidationResult} Validation result
   * @protected
   */
  _validate(value, path) {
    // Type check
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return ValidationResult.failure(this._formatError('Must be an object', path));
    }

    const errors = [];
    const validatedObject = {};

    // Check required fields
    for (const requiredKey of this.requiredKeys) {
      if (!(requiredKey in value)) {
        errors.push(this._formatError(`Missing required field: ${requiredKey}`, path));
      }
    }

    // Validate schema fields
    for (const [key, validator] of Object.entries(this.schema)) {
      const fieldPath = path ? `${path}.${key}` : key;
      const fieldResult = validator.validate(value[key], fieldPath);
      
      if (!fieldResult.isValid) {
        errors.push(...fieldResult.errors);
      } else if (fieldResult.value !== undefined) {
        validatedObject[key] = fieldResult.value;
      }
    }

    // Handle unknown fields
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

// ============================================================================
// UNION VALIDATOR
// ============================================================================

/**
 * Validator for union types - accepts values that match any of the provided validators.
 * Useful for handling multiple possible data types or formats.
 * 
 * @class UnionValidator
 * @extends BaseValidator
 * @example
 * const validator = Schema.union(
 *   Schema.string(),
 *   Schema.number(),
 *   Schema.boolean()
 * );
 * validator.validate('hello'); // Valid: matches string
 * validator.validate(42); // Valid: matches number
 * validator.validate([]); // Invalid: matches none
 */
class UnionValidator extends BaseValidator {
  /**
   * Creates a new UnionValidator instance.
   * 
   * @param {BaseValidator[]} validators - Array of validators to try
   */
  constructor(validators) {
    super();
    
    /** @type {BaseValidator[]} Array of validators to attempt */
    this.validators = validators;
  }

  /**
   * Performs union validation by trying each validator until one succeeds.
   * 
   * @param {*} value - Value to validate
   * @param {string} path - Field path for error reporting
   * @returns {ValidationResult} Validation result
   * @protected
   */
  _validate(value, path) {
    const errors = [];
    
    // Try each validator until one succeeds
    for (const validator of this.validators) {
      const result = validator.validate(value, path);
      if (result.isValid) {
        return result;
      }
      errors.push(...result.errors);
    }

    // If no validator succeeded, return failure with all errors
    return ValidationResult.failure([
      this._formatError('Value does not match any of the expected types', path),
      ...errors
    ]);
  }
}

// ============================================================================
// MAIN SCHEMA FACTORY CLASS
// ============================================================================

/**
 * Main schema factory class providing static methods to create validators.
 * This is the primary entry point for using the validation library.
 * 
 * @class Schema
 * @example
 * // Create validators using static methods
 * const stringValidator = Schema.string().minLength(5);
 * const numberValidator = Schema.number().min(0).max(100);
 * const objectValidator = Schema.object({
 *   name: Schema.string(),
 *   age: Schema.number()
 * });
 */
class Schema {
  /**
   * Creates a string validator.
   * 
   * @returns {StringValidator} New string validator instance
   * @static
   * @example
   * const validator = Schema.string().minLength(3).maxLength(50);
   */
  static string() {
    return new StringValidator();
  }
  
  /**
   * Creates a number validator.
   * 
   * @returns {NumberValidator} New number validator instance
   * @static
   * @example
   * const validator = Schema.number().min(0).max(100).integer();
   */
  static number() {
    return new NumberValidator();
  }
  
  /**
   * Creates a boolean validator.
   * 
   * @returns {BooleanValidator} New boolean validator instance
   * @static
   * @example
   * const validator = Schema.boolean().optional();
   */
  static boolean() {
    return new BooleanValidator();
  }
  
  /**
   * Creates a date validator.
   * 
   * @returns {DateValidator} New date validator instance
   * @static
   * @example
   * const validator = Schema.date().min('2020-01-01').max(new Date());
   */
  static date() {
    return new DateValidator();
  }
  
  /**
   * Creates an object validator with the specified schema.
   * 
   * @param {Object.<string, BaseValidator>} [schema={}] - Object schema
   * @returns {ObjectValidator} New object validator instance
   * @static
   * @example
   * const validator = Schema.object({
   *   name: Schema.string().minLength(1),
   *   age: Schema.number().min(0).optional()
   * }).strict();
   */
  static object(schema = {}) {
    return new ObjectValidator(schema);
  }
  
  /**
   * Creates an array validator with the specified item validator.
   * 
   * @param {BaseValidator} itemValidator - Validator for array items
   * @returns {ArrayValidator} New array validator instance
   * @static
   * @example
   * const validator = Schema.array(Schema.string()).min(1).max(10);
   */
  static array(itemValidator) {
    return new ArrayValidator(itemValidator);
  }

  /**
   * Creates a union validator that accepts values matching any of the provided validators.
   * 
   * @param {...BaseValidator} validators - Validators to try
   * @returns {UnionValidator} New union validator instance
   * @static
   * @example
   * const validator = Schema.union(
   *   Schema.string(),
   *   Schema.number(),
   *   Schema.boolean()
   * );
   */
  static union(...validators) {
    return new UnionValidator(validators);
  }

  /**
   * Creates a literal validator that only accepts the exact specified value.
   * 
   * @param {*} value - The exact value to match
   * @returns {BaseValidator} New literal validator instance
   * @static
   * @example
   * const validator = Schema.literal('admin');
   * validator.validate('admin'); // Valid
   * validator.validate('user'); // Invalid
   */
  static literal(value) {
    return new class extends BaseValidator {
      _validate(val, path) {
        if (val !== value) {
          return ValidationResult.failure(
            this._formatError(`Must be exactly: ${JSON.stringify(value)}`, path)
          );
        }
        return ValidationResult.success(val);
      }
    }();
  }

  /**
   * Creates a validator that accepts any value without validation.
   * 
   * @returns {BaseValidator} New any validator instance
   * @static
   * @example
   * const validator = Schema.any();
   * validator.validate(anything); // Always valid
   */
  static any() {
    return new class extends BaseValidator {
      _validate(val, path) {
        return ValidationResult.success(val);
      }
    }();
  }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Export all classes for Node.js modules and advanced usage.
 * Provides access to individual validator classes for custom extensions.
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Schema,
    ValidationResult,
    BaseValidator,
    StringValidator,
    NumberValidator,
    BooleanValidator,
    DateValidator,
    ArrayValidator,
    ObjectValidator,
    UnionValidator
  };
}

// ============================================================================
// DEMONSTRATION AND TESTING
// ============================================================================

/**
 * Comprehensive demonstration of the validation library features.
 * Shows real-world usage patterns and error handling.
 */
function runDemo() {
  console.log('=== Validation Library Demo ===\n');

  // Define a complex nested schema
  const addressSchema = Schema.object({
    street: Schema.string().minLength(1),
    city: Schema.string().minLength(1),
    postalCode: Schema.string()
      .pattern(/^\d{5}(-\d{4})?$/)
      .withMessage('Postal code must be 5 digits or 5+4 format'),
    country: Schema.string().enum(['USA', 'Canada', 'Mexico'])
  });

  const userSchema = Schema.object({
    id: Schema.string().withMessage('ID must be a string'),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().email(),
    age: Schema.number().min(0).max(150).integer().optional(),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()).min(1).max(10),
    address: addressSchema.optional(),
    metadata: Schema.object({}).passthrough().optional(),
    joinDate: Schema.date().max(new Date()).optional()
  }).strict();

  // Test with valid data
  const validUserData = {
    id: "user123",
    name: "John Doe",
    email: "john.doe@example.com",
    age: 30,
    isActive: true,
    tags: ["developer", "designer"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      postalCode: "12345",
      country: "USA"
    },
    joinDate: "2023-01-15"
  };

  console.log('Testing valid data:');
  const validResult = userSchema.validate(validUserData);
  console.log('Valid:', validResult.isValid);
  
  if (validResult.isValid) {
    console.log('Validated data:', JSON.stringify(validResult.value, null, 2));
  } else {
    console.log('Errors:', validResult.errors);
  }

  // Test with invalid data
  const invalidUserData = {
    id: 123, // Invalid: should be string
    name: "J", // Invalid: too short
    email: "invalid-email", // Invalid: bad format
    age: -5, // Invalid: negative
    isActive: "yes", // Invalid: should be boolean
    tags: [], // Invalid: empty array (min 1)
    address: {
      street: "", // Invalid: empty string
      city: "Test City",
      postalCode: "123", // Invalid: wrong format
      country: "Germany" // Invalid: not in enum
    },
    unknownField: "test" // Invalid: unknown field in strict mode
  };

  console.log('\nTesting invalid data:');
  const invalidResult = userSchema.validate(invalidUserData);
  console.log('Valid:', invalidResult.isValid);
  console.log('Errors:');
  invalidResult.errors.forEach(error => console.log(`  - ${error}`));
}

// Run the demonstration
runDemo();
