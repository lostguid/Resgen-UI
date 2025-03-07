import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { IAMService } from '../../services/IAMService';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [NavbarComponent, SidebarComponent, CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  /**
   *
   */
  constructor(public auth: IAMService) {
  }

}
