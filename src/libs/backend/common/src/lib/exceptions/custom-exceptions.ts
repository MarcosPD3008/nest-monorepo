import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base class for business logic exceptions
 */
export class BusinessLogicException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, statusCode);
    this.name = 'BusinessLogicException';
  }
}

/**
 * Exception thrown when a resource is not found
 */
export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'ResourceNotFoundException';
  }
}

/**
 * Exception thrown when attempting to create a duplicate resource
 */
export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field?: string, value?: unknown) {
    const message = field
      ? `${resource} with ${field} '${value}' already exists`
      : `${resource} already exists`;
    super(message, HttpStatus.CONFLICT);
    this.name = 'DuplicateResourceException';
  }
}

/**
 * Exception thrown when an operation is invalid in the current state
 */
export class InvalidOperationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
    this.name = 'InvalidOperationException';
  }
}

/**
 * Exception thrown when an external service fails
 */
export class ExternalServiceException extends HttpException {
  constructor(
    serviceName: string,
    message?: string,
    statusCode: HttpStatus = HttpStatus.BAD_GATEWAY
  ) {
    const errorMessage = message
      ? `External service '${serviceName}' error: ${message}`
      : `External service '${serviceName}' is unavailable`;
    super(errorMessage, statusCode);
    this.name = 'ExternalServiceException';
  }
}

/**
 * Exception thrown when database operation fails
 */
export class DatabaseException extends HttpException {
  constructor(message: string, originalError?: unknown) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    this.name = 'DatabaseException';
    
    // Store original error for logging (not exposed to client)
    if (originalError) {
      (this as Record<string, unknown>)['originalError'] = originalError;
    }
  }
}

/**
 * Exception thrown when a timeout occurs
 */
export class TimeoutException extends HttpException {
  constructor(operation: string, timeoutMs?: number) {
    const message = timeoutMs
      ? `Operation '${operation}' timed out after ${timeoutMs}ms`
      : `Operation '${operation}' timed out`;
    super(message, HttpStatus.REQUEST_TIMEOUT);
    this.name = 'TimeoutException';
  }
}

/**
 * Exception thrown when rate limit is exceeded
 */
export class RateLimitException extends HttpException {
  constructor(retryAfter?: number) {
    const message = retryAfter
      ? `Rate limit exceeded. Please try again after ${retryAfter} seconds`
      : 'Rate limit exceeded. Please try again later';
    super(message, HttpStatus.TOO_MANY_REQUESTS);
    this.name = 'RateLimitException';
  }
}
