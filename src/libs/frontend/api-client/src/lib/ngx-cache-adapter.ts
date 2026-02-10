import { Injectable } from '@angular/core';
import { CacheService } from '@ngx-cache/core';
import { HttpCacheAdapter } from './http-cache-adapter';

/**
 * Adapter that wraps ngx-cache CacheService for use with BaseHttpService.
 * Allows replacing with custom implementation via HTTP_CACHE_ADAPTER token.
 */
@Injectable()
export class NgxCacheAdapter implements HttpCacheAdapter {
  constructor(private readonly cache: CacheService) {}

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const lifeSpan = ttlMs
      ? { expiry: Date.now() + ttlMs, TTL: ttlMs }
      : undefined;
    this.cache.set(key, value, 0, lifeSpan); // 0 = ReturnType.Scalar
  }

  remove(key: string): void {
    this.cache.remove(key);
  }

  removeByPrefix(prefix: string): void {
    this.cache.remove(prefix, true);
  }
}
