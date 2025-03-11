import { Component, Inject } from '@angular/core';
import { IAMService } from '../../services/IAMService';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Flowbite } from '../../../flowbite-decorator';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
@Flowbite()
export class HomeComponent {

  token: string | null = null;
  isLoggedIn: boolean = false;
  isAuthenticated: boolean = false;

  constructor(public authService: IAMService, private auth0: AuthService, private http: HttpClient) {

    
  }

  ngOnInit(): void {
    this.token = this.authService.getAccessToken();
  }

  login() {
    this.authService.login();    
  }

  logout() {    
    this.authService.logout();    
  }

}
