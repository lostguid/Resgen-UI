import { Component, Inject } from '@angular/core';
import { ResgenAuthService } from '../../services/ResgenAuthService';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  token: string | null = null;
  isLoggedIn: boolean = false;

  constructor(public authService: ResgenAuthService) {


  }

  ngOnInit(): void {
    this.authService.getAccessToken().subscribe(token => {
      this.token = token;
      console.log('Bearer Token:', token);
    });
    

    //this.isLoggedIn = this.authService.isLoggedIn();
  }

  login() {
    this.authService.login();
    this.isLoggedIn = true;
  }

  logout() {    
    this.authService.logout();
    this.isLoggedIn = false;
  }

}
