import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Cache, CacheValue } from '@ngx-cache/core';

/**
 * Cache implementation using sessionStorage for ngx-cache.
 * Use when persistence is needed per browser tab/session.
 */
@Injectable()
export class SessionStorageCacheService implements Cache {
  private get isEnabled(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    try {
      sessionStorage.setItem('__cache_test__', '1');
      sessionStorage.removeItem('__cache_test__');
      return true;
    } catch {
      return false;
    }
  }

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  get keys(): string[] {
    if (!this.isEnabled) {
      return [];
    }
    return Object.keys(sessionStorage);
  }

  setItem(key: string, value: CacheValue): boolean {
    if (!this.isEnabled) return false;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  getItem(key: string): CacheValue | undefined {
    if (!this.isEnabled) return undefined;
    const stored = sessionStorage.getItem(key);
    try {
      return stored ? JSON.parse(stored) : undefined;
    } catch {
      return undefined;
    }
  }

  removeItem(key: string, wild = false): void {
    if (!this.isEnabled) return;
    sessionStorage.removeItem(key);
    if (wild) {
      for (const k of this.keys) {
        if (k.startsWith(key)) {
          sessionStorage.removeItem(k);
        }
      }
    }
  }

  clear(): void {
    if (!this.isEnabled) return;
    sessionStorage.clear();
  }
}
