import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorService } from '../services/error.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private errorService = inject(ErrorService);
  private notificationService = inject(NotificationService);

  handleError(error: Error | unknown): void {
    let errorMessage = 'An unexpected error occurred';
    let errorStack: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
      errorStack = error.stack;
    }

    // Log the error
    console.warn('global-error.handler.handleError - Unhandled error', {
      message: errorMessage,
      error,
      stack: errorStack,
      context: this.getApplicationContext(),
    });

    // Log using error service if it's an Error instance
    if (error instanceof Error) {
      this.errorService.logError(error, 'Global Error Handler');
      
      // Report to external service
      this.errorService.reportError(error, this.getApplicationContext());
    }

    // Show notification for critical errors
    // Only show for actual Error instances, not for promise rejections that are handled
    if (error instanceof Error && !this.isIgnoredError(error)) {
      const category = this.categorizeError(error);
      
      // Check rate limiting
      if (this.shouldShowErrorNotification()) {
        if (category === 'critical') {
          this.notificationService.error(
            'An unexpected error occurred. Please refresh the page or contact support if the problem persists.',
            'Application Error',
            { timeout: 10000 }
          );
        } else if (category === 'warning') {
          this.notificationService.warning(
            'A minor issue occurred. The application should continue to work normally.',
            'Warning',
            { timeout: 5000 }
          );
        }
      } else {
        // Rate limit exceeded, log instead
        console.warn('Error notification rate limit exceeded. Error logged but not shown to user.');
      }
    }
  }

  /**
   * Check if error should be ignored (not shown to user)
   */
  private isIgnoredError(error: Error): boolean {
    // Ignore common browser errors that are not critical
    const ignoredPatterns = [
      /ResizeObserver loop/i,
      /Non-Error promise rejection/i,
      /ChunkLoadError/i, // Webpack chunk loading errors (usually handled by retry)
      /Loading chunk \d+ failed/i,
      /Script error/i, // Cross-origin script errors
    ];

    return ignoredPatterns.some((pattern) => pattern.test(error.message));
  }

  /**
   * Error categories for better handling
   */
  private errorNotificationCount = 0;
  private readonly MAX_NOTIFICATIONS_PER_MINUTE = 5;
  private notificationResetTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Check if we should show notification (rate limiting)
   */
  private shouldShowErrorNotification(): boolean {
    if (this.errorNotificationCount >= this.MAX_NOTIFICATIONS_PER_MINUTE) {
      return false;
    }

    this.errorNotificationCount++;

    // Reset counter after 1 minute
    if (!this.notificationResetTimer) {
      this.notificationResetTimer = setTimeout(() => {
        this.errorNotificationCount = 0;
        this.notificationResetTimer = null;
      }, 60000);
    }

    return true;
  }

  /**
   * Categorize error for better handling
   */
  private categorizeError(error: Error): 'critical' | 'warning' | 'info' {
    const message = error.message.toLowerCase();

    // Critical errors
    if (
      message.includes('cannot read') ||
      message.includes('undefined') ||
      message.includes('null') ||
      message.includes('is not a function')
    ) {
      return 'critical';
    }

    // Warning errors
    if (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('fetch')
    ) {
      return 'warning';
    }

    return 'info';
  }

  /**
   * Get application context for error reporting
   */
  private getApplicationContext(): Record<string, unknown> {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }
}
