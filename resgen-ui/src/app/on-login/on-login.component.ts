import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-on-login',
  imports: [],
  templateUrl: './on-login.component.html',
  styleUrl: './on-login.component.css'
})
export class OnLoginComponent {
  constructor(public auth: AuthService) {}
}
