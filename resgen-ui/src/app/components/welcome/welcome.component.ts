import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { IAMService } from '../../services/IAMService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [NavbarComponent, CommonModule],
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
