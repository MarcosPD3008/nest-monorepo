import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse, ValidationError } from '@libs/shared';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  /**
   * Extract error message from HTTP error response
   */
  getErrorMessage(error: HttpErrorResponse | Error): string {
    if (error instanceof HttpErrorResponse) {
      // Server error response
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        return error.error.message || 'An error occurred';
      } else {
        // Server-side error
        const errorResponse = error.error as ErrorResponse;
        if (errorResponse?.message) {
          return errorResponse.message;
        }
        if (error.error?.message) {
          return error.error.message;
        }
        return this.getDefaultErrorMessage(error.status);
      }
    } else if (error instanceof Error) {
      return error.message || 'An unexpected error occurred';
    }
    return 'An unknown error occurred';
  }

  /**
   * Extract validation errors from HTTP error response
   */
  getValidationErrors(error: HttpErrorResponse): ValidationError[] {
    if (error.error instanceof ErrorEvent) {
      return [];
    }

    const errorResponse = error.error as ErrorResponse;
    if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
      return errorResponse.errors;
    }

    return [];
  }

  /**
   * Get default error message based on status code
   */
  private getDefaultErrorMessage(status: number): string {
    const errorMessages: Record<number, string> = {
      400: 'Bad request. Please check your input.',
      401: 'Unauthorized. Please log in.',
      403: 'Forbidden. You do not have permission to access this resource.',
      404: 'Resource not found.',
      409: 'Conflict. The resource already exists.',
      422: 'Validation failed. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Internal server error. Please try again later.',
      502: 'Bad gateway. The server is temporarily unavailable.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. The request took too long.',
    };

    return errorMessages[status] || `An error occurred (${status})`;
  }

  /**
   * Log error with context
   */
  logError(error: HttpErrorResponse | Error, context?: string): void {
    const message = this.getErrorMessage(error);
    const logMessage = context ? `${context} - ${message}` : message;

    if (error instanceof HttpErrorResponse) {
      console.warn('error.service.logError - HTTP error', {
        message: logMessage,
        status: error.status,
        url: error.url,
        error: error.error,
      });
    } else {
      console.warn('error.service.logError - Error', {
        message: logMessage,
        error: error,
      });
    }
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(error: HttpErrorResponse): boolean {
    return error.status === 400 || error.status === 422;
  }

  /**
   * Check if error is a server error
   */
  isServerError(error: HttpErrorResponse): boolean {
    return error.status >= 500;
  }

  /**
   * Check if error is a client error
   */
  isClientError(error: HttpErrorResponse): boolean {
    return error.status >= 400 && error.status < 500;
  }

  /**
   * Track unique errors to avoid duplicate reporting
   */
  private errorCache = new Set<string>();
  private readonly CACHE_EXPIRY = 60000; // 1 minute

  /**
   * Check if error is unique (not recently reported)
   */
  private isUniqueError(error: Error | HttpErrorResponse): boolean {
    const errorKey = this.getErrorKey(error);
    
    if (this.errorCache.has(errorKey)) {
      return false;
    }

    this.errorCache.add(errorKey);
    
    // Clear cache entry after expiry
    setTimeout(() => {
      this.errorCache.delete(errorKey);
    }, this.CACHE_EXPIRY);

    return true;
  }

  /**
   * Generate unique key for error
   */
  private getErrorKey(error: Error | HttpErrorResponse): string {
    if (error instanceof HttpErrorResponse) {
      return `http_${error.status}_${error.url}`;
    }
    return `error_${error.name}_${error.message}`;
  }

  /**
   * Get browser information for error reporting
   */
  getBrowserInfo(): {
    userAgent: string;
    language: string;
    platform: string;
    screenResolution: string;
    timestamp: string;
  } {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Report error to external service (e.g., Sentry)
   * This is a placeholder for future integration
   */
  reportError(error: Error | HttpErrorResponse, context?: Record<string, unknown>): void {
    // Only report unique errors
    if (!this.isUniqueError(error)) {
      return;
    }

    const errorData = {
      message: this.getErrorMessage(error),
      error: error,
      context: context,
      browserInfo: this.getBrowserInfo(),
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (!this.isProduction()) {
      console.warn('error.service.reportError - Error reported', errorData);
    }

    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorData });
  }

  /**
   * Check if running in production
   */
  private isProduction(): boolean {
    return !window.location.hostname.includes('localhost') &&
           !window.location.hostname.includes('127.0.0.1');
  }
}
