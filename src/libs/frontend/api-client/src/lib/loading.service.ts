import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Loading state for a specific operation
 */
export interface LoadingState {
  key: string;
  isLoading: boolean;
  startTime: number;
  message?: string;
}

/**
 * Service to manage loading states across the application
 * 
 * @example
 * ```typescript
 * // In a component
 * constructor(private loadingService: LoadingService) {}
 * 
 * loadData() {
 *   this.loadingService.start('loadUsers', 'Loading users...');
 *   
 *   this.userService.getAll().subscribe({
 *     next: (users) => {
 *       this.users = users;
 *       this.loadingService.stop('loadUsers');
 *     },
 *     error: () => {
 *       this.loadingService.stop('loadUsers');
 *     }
 *   });
 * }
 * 
 * // In template
 * <div *ngIf="loadingService.isLoading$('loadUsers') | async">
 *   Loading...
 * </div>
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingStates = new Map<string, BehaviorSubject<LoadingState>>();
  private globalLoading = new BehaviorSubject<boolean>(false);

  /**
   * Global loading state (true if any operation is loading)
   */
  readonly isGlobalLoading$: Observable<boolean> = this.globalLoading.asObservable();

  /**
   * Start loading for a specific key
   */
  start(key: string, message?: string): void {
    const state: LoadingState = {
      key,
      isLoading: true,
      startTime: Date.now(),
      message,
    };

    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(key, new BehaviorSubject<LoadingState>(state));
    } else {
      this.loadingStates.get(key)!.next(state);
    }

    this.updateGlobalLoading();
  }

  /**
   * Stop loading for a specific key
   */
  stop(key: string): void {
    const subject = this.loadingStates.get(key);
    if (subject) {
      const currentState = subject.value;
      subject.next({
        ...currentState,
        isLoading: false,
      });
    }

    this.updateGlobalLoading();
  }

  /**
   * Get loading state observable for a specific key
   */
  isLoading$(key: string): Observable<boolean> {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(
        key,
        new BehaviorSubject<LoadingState>({
          key,
          isLoading: false,
          startTime: 0,
        })
      );
    }

    const subject = this.loadingStates.get(key)!;
    return new Observable<boolean>((observer) => {
      const subscription = subject.subscribe((state) => {
        observer.next(state.isLoading);
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get loading state for a specific key (synchronous)
   */
  isLoading(key: string): boolean {
    const subject = this.loadingStates.get(key);
    return subject ? subject.value.isLoading : false;
  }

  /**
   * Get loading message for a specific key
   */
  getMessage$(key: string): Observable<string | undefined> {
    if (!this.loadingStates.has(key)) {
      return new Observable<undefined>((observer) => {
        observer.next(undefined);
        observer.complete();
      });
    }

    const subject = this.loadingStates.get(key)!;
    return new Observable<string | undefined>((observer) => {
      const subscription = subject.subscribe((state) => {
        observer.next(state.message);
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get duration of loading in milliseconds
   */
  getDuration(key: string): number {
    const subject = this.loadingStates.get(key);
    if (!subject || !subject.value.isLoading) {
      return 0;
    }
    return Date.now() - subject.value.startTime;
  }

  /**
   * Clear loading state for a specific key
   */
  clear(key: string): void {
    this.loadingStates.delete(key);
    this.updateGlobalLoading();
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this.loadingStates.clear();
    this.globalLoading.next(false);
  }

  /**
   * Get all active loading keys
   */
  getActiveKeys(): string[] {
    const activeKeys: string[] = [];
    this.loadingStates.forEach((subject, key) => {
      if (subject.value.isLoading) {
        activeKeys.push(key);
      }
    });
    return activeKeys;
  }

  /**
   * Update global loading state
   */
  private updateGlobalLoading(): void {
    const hasActiveLoading = Array.from(this.loadingStates.values()).some(
      (subject) => subject.value.isLoading
    );
    this.globalLoading.next(hasActiveLoading);
  }

  /**
   * Wrap an observable with automatic loading state management
   */
  wrap<T>(key: string, observable: Observable<T>, message?: string): Observable<T> {
    return new Observable<T>((observer) => {
      this.start(key, message);

      const subscription = observable.subscribe({
        next: (value) => observer.next(value),
        error: (error) => {
          this.stop(key);
          observer.error(error);
        },
        complete: () => {
          this.stop(key);
          observer.complete();
        },
      });

      return () => {
        this.stop(key);
        subscription.unsubscribe();
      };
    });
  }
}
