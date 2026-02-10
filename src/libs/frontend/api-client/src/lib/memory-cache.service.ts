import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Cache, CacheValue } from '@ngx-cache/core';

/**
 * Cache implementation using in-memory Map for ngx-cache.
 */
@Injectable()
export class MemoryCacheService implements Cache {
  private readonly memoryStorage = new Map<string, CacheValue>();

  private get isEnabled(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  get keys(): string[] {
    if (!this.isEnabled) return [];
    return Array.from(this.memoryStorage.keys());
  }

  setItem(key: string, value: CacheValue): boolean {
    if (!this.isEnabled) return false;
    this.memoryStorage.set(key, value);
    return true;
  }

  getItem(key: string): CacheValue | undefined {
    if (!this.isEnabled) return undefined;
    return this.memoryStorage.get(key);
  }

  removeItem(key: string, wild = false): void {
    if (!this.isEnabled) return;
    this.memoryStorage.delete(key);
    if (wild) {
      for (const k of this.keys) {
        if (k.startsWith(key)) this.memoryStorage.delete(k);
      }
    }
  }

  clear(): void {
    if (!this.isEnabled) return;
    this.memoryStorage.clear();
  }
}
