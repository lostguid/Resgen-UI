import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable, combineLatest, from, map, of, switchMap } from 'rxjs';

const ROLES_CLAIM = 'http://resgen-claim/roles';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private rolesSubject = new BehaviorSubject<string[]>([]);
  roles$: Observable<string[]> = this.rolesSubject.asObservable();
  isAdmin$: Observable<boolean> = this.roles$.pipe(map(roles => roles.includes('admin')));

  constructor(private auth0: AuthService) {
    this.auth0.isAuthenticated$
      .pipe(
        switchMap(isAuth => (isAuth ? from(this.auth0.getAccessTokenSilently()) : of('')))
      )
      .subscribe(token => this.rolesSubject.next(this.extractRoles(token)));
  }

  hasRole(role: string): boolean {
    return this.rolesSubject.value.includes(role);
  }

  get isAdmin(): boolean {
    return this.hasRole('admin');
  }

  private extractRoles(token: string): string[] {
    if (!token) return [];
    try {
      const payload = token.split('.')[1];
      if (!payload) return [];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
      const decoded = JSON.parse(atob(padded));
      const roles = decoded?.[ROLES_CLAIM];
      return Array.isArray(roles) ? roles : [];
    } catch {
      return [];
    }
  }
}
