import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-on-login',
  imports: [CommonModule],
  templateUrl: './on-login.component.html',
  styleUrl: './on-login.component.css'
})
export class OnLoginComponent {
  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService) {}
}
