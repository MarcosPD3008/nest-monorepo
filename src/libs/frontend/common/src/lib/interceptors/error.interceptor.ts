import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timer, retry } from 'rxjs';
import { ErrorService } from '../services/error.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const notificationService = inject(NotificationService);
  let retryCount = 0;

  return next(req).pipe(
    retry({
      count: DEFAULT_RETRY_CONFIG.maxRetries,
      delay: (error: HttpErrorResponse) => {
        // Only retry for specific errors
        if (shouldRetry(error, retryCount, DEFAULT_RETRY_CONFIG)) {
          retryCount++;
          const delay = getRetryDelay(retryCount - 1, DEFAULT_RETRY_CONFIG.retryDelay);
          
          // Show retry notification for network errors
          if (error.status === 0) {
            notificationService.warning(
              `Connection lost. Retrying in ${delay / 1000}s... (Attempt ${retryCount}/${DEFAULT_RETRY_CONFIG.maxRetries})`,
              'Network Error',
              { timeout: delay }
            );
          }
          
          return timer(delay);
        }
        
        // Don't retry, throw error immediately
        throw error;
      },
    }),
    catchError((error: HttpErrorResponse) => {
      // Extract error message
      const errorMessage = errorService.getErrorMessage(error);
      
      // Log the error
      errorService.logError(error, `HTTP ${req.method} ${req.url}`);

      // Show notification based on error type
      if (shouldShowNotification(error, req)) {
        showErrorNotification(error, errorMessage, errorService, notificationService);
      }

      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};

function shouldShowNotification(error: HttpErrorResponse, request: HttpRequest<unknown>): boolean {
  // Don't show notification for 401 if it's an auth endpoint (to avoid duplicate messages)
  if (error.status === 401 && request.url.includes('/auth')) {
    return false;
  }

  // Don't show notification for 404 if it's a GET request (might be expected)
  if (error.status === 404 && request.method === 'GET') {
    return false;
  }

  // Show notification for all other errors
  return true;
}

function showErrorNotification(
  error: HttpErrorResponse,
  message: string,
  errorService: ErrorService,
  notificationService: NotificationService
): void {
  const validationErrors = errorService.getValidationErrors(error);

  if (validationErrors.length > 0) {
    // Show validation errors
    const validationMessages = validationErrors
      .map((err) => `${err.field}: ${err.message}`)
      .join('\n');
    
    notificationService.error(
      validationMessages,
      'Validation Error',
      { timeout: 8000 }
    );
  } else {
    // Show general error
    const title = getErrorTitle(error.status);
    notificationService.error(message, title);
  }
}

function getErrorTitle(status: number): string {
  const titles: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Validation Error',
    429: 'Too Many Requests',
    500: 'Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return titles[status] || 'Error';
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Check if error should be retried
 */
function shouldRetry(error: HttpErrorResponse, retryCount: number, config: RetryConfig): boolean {
  if (retryCount >= config.maxRetries) {
    return false;
  }

  // Retry on network errors
  if (error.status === 0) {
    return true;
  }

  // Retry on specific status codes
  return config.retryableStatuses.includes(error.status);
}

/**
 * Calculate retry delay with exponential backoff
 */
function getRetryDelay(retryCount: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, retryCount);
}
