import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Cache, CacheValue } from '@ngx-cache/core';

/**
 * Cache implementation using localStorage for ngx-cache.
 */
@Injectable()
export class LocalStorageCacheService implements Cache {
  private get isEnabled(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      localStorage.setItem('__cache_test__', '1');
      localStorage.removeItem('__cache_test__');
      return true;
    } catch {
      return false;
    }
  }

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  get keys(): string[] {
    if (!this.isEnabled) return [];
    return Object.keys(localStorage);
  }

  setItem(key: string, value: CacheValue): boolean {
    if (!this.isEnabled) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  getItem(key: string): CacheValue | undefined {
    if (!this.isEnabled) return undefined;
    const stored = localStorage.getItem(key);
    try {
      return stored ? JSON.parse(stored) : undefined;
    } catch {
      return undefined;
    }
  }

  removeItem(key: string, wild = false): void {
    if (!this.isEnabled) return;
    localStorage.removeItem(key);
    if (wild) {
      for (const k of this.keys) {
        if (k.startsWith(key)) localStorage.removeItem(k);
      }
    }
  }

  clear(): void {
    if (!this.isEnabled) return;
    localStorage.clear();
  }
}
