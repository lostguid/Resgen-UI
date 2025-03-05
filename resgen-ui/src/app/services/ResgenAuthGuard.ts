import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ResgenAuthService } from './ResgenAuthService';


@Injectable({
  providedIn: 'root'
})
export class ResgenAuthGuard implements CanActivate {

  constructor(private authService: ResgenAuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}