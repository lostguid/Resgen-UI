import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Flowbite } from '../../../flowbite-decorator';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
@Flowbite()
export class WelcomeComponent {
  constructor(private router: Router) {}

  navigateToCreateProfile(): void {
    this.router.navigate(['/profiles/create']); // Adjust the route as per your app's routing configuration
  }
}
