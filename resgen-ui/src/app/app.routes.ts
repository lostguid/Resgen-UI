import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from '@auth0/auth0-angular';
import { AccountComponent } from './components/account/account.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CreateProfileComponent } from './components/profile/create-profile/create-profile.component';
import { ResumeComponent } from './components/resume/resume.component';
import { EditProfileComponent } from './components/profile/edit-profile/edit-profile.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

export const routes: Routes = [  
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
    { path: 'profiles', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'resumes', component: ResumeComponent, canActivate: [AuthGuard] },
    { path: 'profiles/create', component: CreateProfileComponent, canActivate: [AuthGuard] },
    { path: 'profiles/edit/:id', component: EditProfileComponent, canActivate: [AuthGuard]  },
    { path: '', redirectTo: '/welcome', pathMatch: 'full' }
];