import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { User, ApiResponse } from '@libs/shared';

/**
 * Example user service extending BaseHttpService.
 * Uses ngx-cache (sessionStorage by default) with auto-invalidation on create/update/delete.
 *
 * @example
 * ```typescript
 * // In a component
 * constructor(private userService: UserService) {}
 *
 * loadUsers() {
 *   this.userService.getAll().subscribe(response => {
 *     this.users = response.data;
 *   });
 * }
 *
 * loadUsersCached() {
 *   this.userService.getAllCached().subscribe(response => {
 *     this.users = response.data;
 *   });
 * }
 *
 * createUser(user: Partial<User>) {
 *   this.userService.create(user).subscribe(response => {
 *     console.log('User created:', response.data);
 *     // Cache is automatically invalidated
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseHttpService<User> {
  constructor(http: HttpClient) {
    super(http, '/api/users', {
      cacheScope: 'users',
      cacheTtl: 300000,
      retry: { count: 2, delay: 1500, retryStatusCodes: [502, 503, 504] },
    });
  }

  /**
   * Get all users with caching
   */
  getAllCached(): Observable<ApiResponse<User[]>> {
    return this.getCached('all', () => this.getAll());
  }

  /**
   * Get user by ID with caching
   */
  getByIdCached(id: string | number): Observable<ApiResponse<User>> {
    return this.getCached(`id:${id}`, () => this.getById(id));
  }

  /**
   * Get user by email
   */
  getByEmail(email: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/email/${email}`);
  }

  /**
   * Activate user (invalidates cache)
   */
  activate(id: string | number): Observable<ApiResponse<User>> {
    return this.http
      .post<ApiResponse<User>>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(tap(() => this.invalidateCache()));
  }

  /**
   * Deactivate user (invalidates cache)
   */
  deactivate(id: string | number): Observable<ApiResponse<User>> {
    return this.http
      .post<ApiResponse<User>>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(tap(() => this.invalidateCache()));
  }
}
