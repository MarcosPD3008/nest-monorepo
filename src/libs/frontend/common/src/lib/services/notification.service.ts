import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title?: string;
  timeout?: number;
  enableHtml?: boolean;
  closeButton?: boolean;
  progressBar?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly defaultOptions: NotificationOptions = {
    timeout: 5000,
    enableHtml: false,
    closeButton: true,
    progressBar: true,
  };

  constructor(private toastr: ToastrService) {}

  /**
   * Show success notification
   */
  success(message: string, title?: string, options?: NotificationOptions): void {
    const opts = { ...this.defaultOptions, ...options };
    this.toastr.success(message, title || 'Success', {
      timeOut: opts.timeout,
      enableHtml: opts.enableHtml,
      closeButton: opts.closeButton,
      progressBar: opts.progressBar,
    });
  }

  /**
   * Show error notification
   */
  error(message: string, title?: string, options?: NotificationOptions): void {
    const opts = { ...this.defaultOptions, ...options, timeout: options?.timeout || 7000 };
    this.toastr.error(message, title || 'Error', {
      timeOut: opts.timeout,
      enableHtml: opts.enableHtml,
      closeButton: opts.closeButton,
      progressBar: opts.progressBar,
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, title?: string, options?: NotificationOptions): void {
    const opts = { ...this.defaultOptions, ...options };
    this.toastr.warning(message, title || 'Warning', {
      timeOut: opts.timeout,
      enableHtml: opts.enableHtml,
      closeButton: opts.closeButton,
      progressBar: opts.progressBar,
    });
  }

  /**
   * Show info notification
   */
  info(message: string, title?: string, options?: NotificationOptions): void {
    const opts = { ...this.defaultOptions, ...options };
    this.toastr.info(message, title || 'Info', {
      timeOut: opts.timeout,
      enableHtml: opts.enableHtml,
      closeButton: opts.closeButton,
      progressBar: opts.progressBar,
    });
  }

  /**
   * Show notification based on type
   */
  show(
    type: NotificationType,
    message: string,
    title?: string,
    options?: NotificationOptions
  ): void {
    switch (type) {
      case 'success':
        this.success(message, title, options);
        break;
      case 'error':
        this.error(message, title, options);
        break;
      case 'warning':
        this.warning(message, title, options);
        break;
      case 'info':
        this.info(message, title, options);
        break;
    }
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.toastr.clear();
  }

  /**
   * Notification queue to prevent spam
   */
  private notificationQueue = new Map<string, number>();
  private readonly QUEUE_TIMEOUT = 3000; // 3 seconds

  /**
   * Check if notification should be shown (not recently shown)
   */
  private shouldShowNotification(message: string, type: NotificationType): boolean {
    const key = `${type}_${message}`;
    const lastShown = this.notificationQueue.get(key);

    if (lastShown && Date.now() - lastShown < this.QUEUE_TIMEOUT) {
      return false; // Skip duplicate notification
    }

    this.notificationQueue.set(key, Date.now());
    
    // Clean up old entries
    setTimeout(() => {
      this.notificationQueue.delete(key);
    }, this.QUEUE_TIMEOUT);

    return true;
  }

  /**
   * Show success notification with queue check
   */
  successSafe(message: string, title?: string, options?: NotificationOptions): void {
    if (this.shouldShowNotification(message, 'success')) {
      this.success(message, title, options);
    }
  }

  /**
   * Show error notification with queue check
   */
  errorSafe(message: string, title?: string, options?: NotificationOptions): void {
    if (this.shouldShowNotification(message, 'error')) {
      this.error(message, title, options);
    }
  }

  /**
   * Show warning notification with queue check
   */
  warningSafe(message: string, title?: string, options?: NotificationOptions): void {
    if (this.shouldShowNotification(message, 'warning')) {
      this.warning(message, title, options);
    }
  }

  /**
   * Show info notification with queue check
   */
  infoSafe(message: string, title?: string, options?: NotificationOptions): void {
    if (this.shouldShowNotification(message, 'info')) {
      this.info(message, title, options);
    }
  }

  /**
   * Show persistent notification (no timeout)
   */
  showPersistent(message: string, title?: string, type: NotificationType = 'info'): void {
    const opts = {
      ...this.defaultOptions,
      timeout: 0, // No timeout
      closeButton: true,
    };

    switch (type) {
      case 'success':
        this.toastr.success(message, title || 'Success', opts);
        break;
      case 'error':
        this.toastr.error(message, title || 'Error', opts);
        break;
      case 'warning':
        this.toastr.warning(message, title || 'Warning', opts);
        break;
      case 'info':
        this.toastr.info(message, title || 'Info', opts);
        break;
    }
  }

  /**
   * Show notification with custom action button
   * Note: ngx-toastr doesn't support action buttons out of the box
   * This is a placeholder for future enhancement with a custom toast component
   */
  showWithAction(
    message: string,
    actionText: string,
    callback: () => void,
    title?: string,
    type: NotificationType = 'info'
  ): void {
    // For now, show a regular notification
    // TODO: Implement custom toast component with action button
    const enhancedMessage = `${message} (${actionText})`;
    this.show(type, enhancedMessage, title);
    
    // Log that action button feature is not yet implemented
    console.info('NotificationService: Action button feature pending custom toast component implementation');
  }
}
