import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, Event } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { IAMService } from './services/IAMService';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { HomeComponent } from './components/home/home.component';
import { FlowbiteService } from './services/FlowBite.service';
import { AuthService } from '@auth0/auth0-angular';
import { Flowbite } from '../flowbite-decorator';
import { delay, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
@Flowbite()
export class AppComponent implements OnInit {
  title = 'resgen-ui';
  isAuthenticated: boolean = false;

  userImageUrl: string | null = localStorage.getItem('user.picture'); // Initialize the string property
  user: any = {};


  constructor(private router: Router, public auth: IAMService, private http: HttpClient, private flowbiteService: FlowbiteService, private auth0: AuthService) {   
  }

  ngOnInit(): void {
    // this.flowbiteService.loadFlowbite((flowbite) => {
    //   initFlowbite();
    // });
    this.auth0.isAuthenticated$.subscribe(
      (isAuthenticated) => {        
        this.isAuthenticated = isAuthenticated;
        if(this.isAuthenticated == true){
          
          of(null).pipe(
            delay(1),
            switchMap(() => this.http.get<any>(environment.apiUrl+`/User/userId/` + localStorage.getItem('user.id')))
          ).subscribe(response => {
            this.user = response;
            this.userImageUrl = localStorage.getItem('user.picture');
          });
        }        
      });
  }

  login(){
    this.auth.login();
  }

  openHomeTab(){
    this.router.navigate(['/home']);
  }

  openProfilesTab(){
    this.router.navigate(['/profiles']);
  }

  openResumesTab(){
    this.router.navigate(['/resumes']);
  }

  openAccountTab(){
    this.router.navigate(['/account']);
  }

  logout() {
    this.auth.logout();
  }
}
