import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, Event } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

import { IStaticMethods } from 'preline/preline';
import { IAMService } from './services/IAMService';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'resgen-ui';
  

  constructor(private router: Router, private auth: IAMService) {    
    
  }

  ngOnInit() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          // @ts-ignore
          HSStaticMethods.autoInit();
        }, 100);
      }
    });   

  }
}
