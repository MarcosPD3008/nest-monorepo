import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { shareReplay } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '@libs/shared';
import { retryRequest, RetryConfig } from './retry.operator';
import { HttpCacheAdapter } from './http-cache-adapter';

/**
 * Injection token for HTTP cache adapter. Provide a custom implementation to replace ngx-cache.
 */
export const HTTP_CACHE_ADAPTER = new InjectionToken<HttpCacheAdapter | null>('HTTP_CACHE_ADAPTER');

/**
 * HTTP request options
 */
export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Options for BaseHttpService
 */
export interface BaseHttpServiceOptions {
  /** Cache scope (e.g. 'users') - enables caching and invalidates on create/update/delete */
  cacheScope?: string;
  /** Cache TTL in ms (default: 300000) */
  cacheTtl?: number;
  /** Retry configuration */
  retry?: RetryConfig;
}

/**
 * Base HTTP service with common CRUD operations using Angular HttpClient.
 * Uses ngx-cache (sessionStorage by default, configurable by environment) with auto-invalidation on create/update/delete.
 *
 * @example
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class UserService extends BaseHttpService<User> {
 *   constructor(http: HttpClient) {
 *     super(http, '/api/users', { cacheScope: 'users', retry: { count: 2 } });
 *   }
 *
 *   getAllCached(): Observable<ApiResponse<User[]>> {
 *     return this.getCached('all', () => this.getAll());
 *   }
 * }
 * ```
 */
export abstract class BaseHttpService<T> {
  private cacheAdapter = inject(HTTP_CACHE_ADAPTER, { optional: true });

  constructor(
    protected http: HttpClient,
    protected baseUrl: string,
    protected options?: BaseHttpServiceOptions
  ) {}

  /**
   * Get all resources with optional pagination
   */
  getAll(pagination?: PaginationOptions, options?: HttpOptions): Observable<ApiResponse<T[]>> {
    const params = this.buildPaginationParams(pagination);
    return this.request(
      this.http.get<ApiResponse<T[]>>(this.baseUrl, {
        ...options,
        params: params || options?.params,
      })
    );
  }

  /**
   * Get paginated resources
   */
  getPaginated(pagination?: PaginationOptions, options?: HttpOptions): Observable<PaginatedResponse<T>> {
    const params = this.buildPaginationParams(pagination);
    return this.request(
      this.http.get<PaginatedResponse<T>>(`${this.baseUrl}/paginated`, {
        ...options,
        params: params || options?.params,
      })
    );
  }

  /**
   * Get a single resource by ID
   */
  getById(id: string | number, options?: HttpOptions): Observable<ApiResponse<T>> {
    return this.request(
      this.http.get<ApiResponse<T>>(`${this.baseUrl}/${id}`, options)
    );
  }

  /**
   * Create a new resource (invalidates cache when cacheScope is configured)
   */
  create(data: Partial<T>, options?: HttpOptions): Observable<ApiResponse<T>> {
    const obs = this.request<ApiResponse<T>>(
      this.http.post<ApiResponse<T>>(this.baseUrl, data, options)
    );
    return obs.pipe(tap(() => this.invalidateCache()));
  }

  /**
   * Update an existing resource (invalidates cache when cacheScope is configured)
   */
  update(id: string | number, data: Partial<T>, options?: HttpOptions): Observable<ApiResponse<T>> {
    const obs = this.request<ApiResponse<T>>(
      this.http.put<ApiResponse<T>>(`${this.baseUrl}/${id}`, data, options)
    );
    return obs.pipe(tap(() => this.invalidateCache()));
  }

  /**
   * Partially update a resource (invalidates cache when cacheScope is configured)
   */
  patch(id: string | number, data: Partial<T>, options?: HttpOptions): Observable<ApiResponse<T>> {
    const obs = this.request<ApiResponse<T>>(
      this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${id}`, data, options)
    );
    return obs.pipe(tap(() => this.invalidateCache()));
  }

  /**
   * Delete a resource (invalidates cache when cacheScope is configured)
   */
  delete(id: string | number, options?: HttpOptions): Observable<ApiResponse<void>> {
    const obs = this.request<ApiResponse<void>>(
      this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, options)
    );
    return obs.pipe(tap(() => this.invalidateCache()));
  }

  /**
   * Search resources
   */
  search(query: string, pagination?: PaginationOptions, options?: HttpOptions): Observable<ApiResponse<T[]>> {
    const params = this.buildPaginationParams(pagination);
    if (params) {
      params.set('q', query);
    }

    return this.request(
      this.http.get<ApiResponse<T[]>>(`${this.baseUrl}/search`, {
        ...options,
        params: params || { q: query, ...(options?.params as Record<string, unknown>) },
      })
    );
  }

  /**
   * Get from cache or execute request when cacheScope and HttpCacheAdapter are configured.
   */
  protected getCached<R>(suffix: string, factory: () => Observable<R>, ttl?: number): Observable<R> {
    const scope = this.options?.cacheScope;
    const adapter = this.cacheAdapter;
    const ttlMs = ttl ?? this.options?.cacheTtl ?? 300000;

    if (!scope || !adapter) {
      return factory();
    }

    const key = `${scope}:${suffix}`;
    const cached = adapter.get<R>(key);
    if (cached !== undefined) {
      return of(cached);
    }

    return factory().pipe(
      tap((data) => adapter.set(key, data, ttlMs)),
      shareReplay(1)
    );
  }

  /**
   * Apply retry logic if configured
   */
  protected request<R>(obs: Observable<R>): Observable<R> {
    if (this.options?.retry) {
      return obs.pipe(retryRequest<R>(this.options.retry));
    }
    return obs;
  }

  /**
   * Invalidate cache for this service (called on create/update/delete)
   */
  protected invalidateCache(): void {
    const scope = this.options?.cacheScope;
    const adapter = this.cacheAdapter;
    if (scope && adapter) {
      adapter.removeByPrefix(`${scope}:`);
    }
  }

  /**
   * Build pagination params
   */
  protected buildPaginationParams(pagination?: PaginationOptions): HttpParams | undefined {
    if (!pagination) {
      return undefined;
    }

    let params = new HttpParams();

    if (pagination.page !== undefined) {
      params = params.set('page', pagination.page.toString());
    }

    if (pagination.pageSize !== undefined) {
      params = params.set('pageSize', pagination.pageSize.toString());
    }

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
    }

    if (pagination.sortOrder) {
      params = params.set('sortOrder', pagination.sortOrder);
    }

    return params;
  }

  /**
   * Build URL with path segments
   */
  protected buildUrl(...segments: (string | number)[]): string {
    return [this.baseUrl, ...segments].join('/');
  }
}
