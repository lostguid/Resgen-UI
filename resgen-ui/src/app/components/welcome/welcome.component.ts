import { Component } from '@angular/core';
import { IAMService } from '../../services/IAMService';

@Component({
  selector: 'app-welcome',
  imports: [],
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
