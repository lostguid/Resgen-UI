import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, switchMap, tap } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class IAMService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

    constructor(private router: Router, private auth0: AuthService) {
        this.auth0.isAuthenticated$.pipe(
            tap(isAuthenticated => {
                this.isAuthenticatedSubject.next(isAuthenticated);
                if (isAuthenticated) {
                    if (localStorage.getItem('user.auth0.token') === null || localStorage.getItem('user.auth0.token') === '') {
                        this.auth0.getAccessTokenSilently().subscribe(token => {
                            localStorage.setItem('user.auth0.token', token || '');
                        }, error => {
                            localStorage.setItem('user.auth0.token', '');
                            console.error('Error getting access token', error);
                        });
                    }
                    if (localStorage.getItem('user.id') === null || localStorage.getItem('user.id') === '') {
                        this.auth0.user$.subscribe(user => {
                            //debugger;
                            if (user?.sub?.includes('google-oauth2')) { //For Google logged IN USERS
                                //localStorage.setItem('userAttributes', JSON.stringify(user));
                                localStorage.setItem('user.id', user?.sub || '');
                                localStorage.setItem('user.name', user?.name || '');
                                localStorage.setItem('user.email', user?.email || '');
                                localStorage.setItem('user.picture', user?.picture || '');

                            }
                            else{
                                localStorage.setItem('user.id', user?.sub || '');
                                localStorage.setItem('user.name', user?.name || '');
                                localStorage.setItem('user.email', user?.email || '');
                                localStorage.setItem('user.picture', user?.picture || '');
                            }
                        });
                    }

                } else {
                    this.clearLocalStorageOfUser();
                    console.log('User either logged out or Authentication Failed or Login Session expired.');
                }
            })
        ).subscribe();
    }


    getAccessToken(): string {
        return localStorage.getItem('user.auth0.token') || '';
    }

    login(): void {        
        this.auth0.loginWithRedirect();
    }


    logout(): void {
        // Clear the stored token and any other authentication state
        this.clearLocalStorageOfUser();
        this.auth0.logout({ logoutParams: { returnTo: environment.auth.logOutUri } })
    }

    clearLocalStorageOfUser(): void {
        localStorage.removeItem('user.id');
        localStorage.removeItem('user.name');
        localStorage.removeItem('user.email');
        localStorage.removeItem('user.picture');
        localStorage.removeItem('user.auth0.token');
    }
}