import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnLoginComponent } from './on-login/on-login.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OnLoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'resgen-ui';
}
