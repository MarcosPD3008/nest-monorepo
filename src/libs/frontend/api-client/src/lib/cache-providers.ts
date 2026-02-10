import { importProvidersFrom, EnvironmentProviders, Provider } from '@angular/core';
import { CacheLoader, CacheModule, CacheStaticLoader, CACHE } from '@ngx-cache/core';
import { LocalStorageCacheService } from './local-storage-cache.service';
import { MemoryCacheService } from './memory-cache.service';
import { NgxCacheAdapter } from './ngx-cache-adapter';
import { HTTP_CACHE_ADAPTER } from './base-http.service';
import { SessionStorageCacheService } from './session-storage-cache.service';

export type CacheStorageType = 'memory' | 'session' | 'local';

/**
 * Cache configuration. Set storage type by environment.
 */
export interface CacheConfig {
  /** 'memory' | 'session' | 'local'. Default: 'session' */
  storage?: CacheStorageType;
  /** Cache key prefix (default: 'NGX_CACHE') */
  key?: string;
  /** Default TTL in ms (default: 5 min) */
  ttl?: number;
}

/**
 * Get the Cache implementation class for the given storage type.
 */
function getCacheClass(storage: CacheStorageType) {
  switch (storage) {
    case 'memory':
      return MemoryCacheService;
    case 'local':
      return LocalStorageCacheService;
    case 'session':
    default:
      return SessionStorageCacheService;
  }
}

/**
 * Provides ngx-cache with configurable storage (sessionStorage by default).
 * Configurable by environment - pass storage: 'memory' | 'session' | 'local'.
 * Does NOT use BrowserCacheModule (incompatible with Angular 21+) - provides CACHE directly.
 *
 * @example
 * ```typescript
 * // In app.config.ts
 * import { provideHttpCache } from '@libs/frontend/api-client';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpCache({ storage: 'session' }), // or from environment
 *     ...
 *   ],
 * };
 * ```
 */
export function provideHttpCache(config: CacheConfig = {}): (Provider | EnvironmentProviders)[] {
  const storage = config.storage ?? 'session';
  const cacheKey = config.key ?? 'NGX_CACHE';
  const ttl = config.ttl ?? 300000;

  const cacheLoader = new CacheStaticLoader({
    key: cacheKey,
    lifeSpan: { expiry: Number.MAX_VALUE, TTL: ttl },
  });

  return [
    importProvidersFrom(
      CacheModule.forRoot({
        provide: CacheLoader,
        useValue: cacheLoader,
      } as any)
    ),
    { provide: CACHE, useClass: getCacheClass(storage) },
    NgxCacheAdapter,
    {
      provide: HTTP_CACHE_ADAPTER,
      useExisting: NgxCacheAdapter,
    },
  ];
}
