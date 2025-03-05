import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ResgenAuthService {

    private isAuthenticated = false;

    constructor(private router: Router, private auth0: AuthService) { }

    getAccessToken(): Observable<string> {
        return this.auth0.isAuthenticated$.pipe(
            switchMap(isAuthenticated => {
                if (isAuthenticated) {
                    return from(this.auth0.getAccessTokenSilently());
                } else {
                    //redirect to login page
                    // this.auth0.loginWithRedirect();
                    return from(Promise.resolve(''));
                }
            })
        );
    }

    login(): void {        
        this.auth0.loginWithRedirect();
        this.loginSuccessful();
      }

    loginSuccessful(){
        this.isAuthenticated = true;
    }

    logout(): void {
        this.isAuthenticated = false;
        // Clear the stored token and any other authentication state
        this.auth0.logout({ logoutParams: { returnTo: 'http://localhost:4200/home' } })
        //this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return this.isAuthenticated;
    }

    // isAuthenticated(): boolean {
    //     // Implement your logic to check if the user is authenticated
    //     return !!localStorage.getItem('token');
    // }
}