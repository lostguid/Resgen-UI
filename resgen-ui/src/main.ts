import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAuth0 } from '@auth0/auth0-angular';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authHttpInterceptorFn } from '@auth0/auth0-angular';
import { Auth0HttpInerceptorFnService } from './app/services/auth0-http-inerceptor-fn.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([Auth0HttpInerceptorFnService])),
    provideAuth0({
      domain: environment.auth.domain,
      clientId: environment.auth.clientId,
      authorizationParams: {
        redirect_uri: environment.auth.redirectUri,
        audience: environment.auth.audience
      }
    }),
    importProvidersFrom(CommonModule),    
    provideRouter(routes)
  ]
})
  .catch((err) => console.error(err));
