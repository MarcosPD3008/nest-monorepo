import { Observable } from 'rxjs';

/**
 * Adapter interface for HTTP response caching.
 * Allows replacing ngx-cache with custom implementations.
 */
export interface HttpCacheAdapter {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlMs?: number): void;
  remove(key: string): void;
  removeByPrefix(prefix: string): void;
}
