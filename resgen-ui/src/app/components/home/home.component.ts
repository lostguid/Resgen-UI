import { Component, Inject } from '@angular/core';
import { IAMService } from '../../services/IAMService';
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

  constructor(public authService: IAMService) {


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
