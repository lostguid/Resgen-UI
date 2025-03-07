import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from '@auth0/auth0-angular';
import { WelcomeComponent } from './components/welcome/welcome.component';

export const routes: Routes = [  
    { path: 'home', component: HomeComponent },
    { path: 'welcome', component: WelcomeComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/welcome', pathMatch: 'full' }
];