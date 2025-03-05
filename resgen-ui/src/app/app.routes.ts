import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from '@auth0/auth0-angular';

export const routes: Routes = [  
    { path: 'home', component: HomeComponent },
    //{ path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];