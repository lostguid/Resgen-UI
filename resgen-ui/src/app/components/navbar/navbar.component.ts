import { Component } from '@angular/core';
import { IAMService } from '../../services/IAMService';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // Corrected property name
})
export class NavbarComponent {
  userImageUrl: string | null = localStorage.getItem('user.picture'); // Initialize the string property

  constructor(private auth: IAMService, private auth0: IAMService) {
  }


  ngonInit() {
    this.userImageUrl = localStorage.getItem('user.picture'); // Set the string property
  }

  logout() {
    this.auth.logout();
  }
}