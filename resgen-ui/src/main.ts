import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAuth0 } from '@auth0/auth0-angular';

bootstrapApplication(AppComponent, {
  providers: [
    provideAuth0({
      domain: 'harshith-reddy.us.auth0.com',
      clientId: 'SZyi2Y3UDCmUvP3iYZ2xtrP8MFIJr1xo',
      authorizationParams: {
        redirect_uri: 'https://localhost:4200'
      }
    }),
  ]
})
  .catch((err) => console.error(err));
