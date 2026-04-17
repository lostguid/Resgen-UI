import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Flowbite } from '../../../flowbite-decorator';
import { IAMService } from '../../services/IAMService';
import { HeroHighlightComponent, HighlightComponent } from '../hero-highlight/hero-highlight.component';

@Component({
  selector: 'app-welcome',
  imports: [HeroHighlightComponent, HighlightComponent],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
@Flowbite()
export class WelcomeComponent {
  constructor(private router: Router, private auth: IAMService) {}

  getStarted(): void {
    this.router.navigate(['/home']);
  }

  navigateToCreateProfile(): void {
    this.router.navigate(['/profiles/create']);
  }
}
