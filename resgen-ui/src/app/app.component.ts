import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, Event } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { IAMService } from './services/IAMService';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { HomeComponent } from './components/home/home.component';
import { FlowbiteService } from './services/FlowBite.service';
import { AccountComponent } from './components/account/account.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'resgen-ui';

  userImageUrl: string | null = localStorage.getItem('user.picture'); // Initialize the string property
  user: any = {};


  constructor(private router: Router, public auth: IAMService, private http: HttpClient, private flowbiteService: FlowbiteService) {
    let userId = localStorage.getItem('user.id');
    this.http.get<any>(environment.apiUrl + `/User/userId/` + userId).subscribe(response => {
      this.user = response;
    });
    
  }

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });  

  }

  logout() {
    this.auth.logout();
  }
}
