import { Observable, retry, timer } from 'rxjs';

/**
 * Retry configuration for HTTP requests
 */
export interface RetryConfig {
  /** Number of retry attempts (default: 3) */
  count?: number;
  /** Delay between retries in ms (default: 1000) */
  delay?: number;
  /** Reset retry counter on successful emission (default: false) */
  resetOnSuccess?: boolean;
  /** Only retry on specific HTTP status codes (e.g. [502, 503]). Empty = retry all errors */
  retryStatusCodes?: number[];
}

const DEFAULT_RETRY_CONFIG: Required<Omit<RetryConfig, 'retryStatusCodes'>> & {
  retryStatusCodes: number[];
} = {
  count: 3,
  delay: 1000,
  resetOnSuccess: false,
  retryStatusCodes: [],
};

/**
 * Retry failed HTTP requests with configurable attempts and delay.
 * Uses RxJS retry under the hood.
 *
 * @example
 * ```typescript
 * this.http.get('/api/users').pipe(
 *   retryRequest({ count: 3, delay: 2000 })
 * ).subscribe(...);
 *
 * // Only retry on 5xx errors
 * this.http.get('/api/users').pipe(
 *   retryRequest({ count: 2, retryStatusCodes: [502, 503, 504] })
 * ).subscribe(...);
 * ```
 */
export function retryRequest<T>(config: RetryConfig = {}): (source: Observable<T>) => Observable<T> {
  const { count, delay, resetOnSuccess, retryStatusCodes } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  const retry$ = retry<T>({
    count,
    delay: (error, retryCount) => {
      if (retryStatusCodes.length > 0 && error?.status && !retryStatusCodes.includes(error.status)) {
        throw error;
      }
      return timer(delay);
    },
    resetOnSuccess,
  });

  return (source: Observable<T>) => source.pipe(retry$);
}
