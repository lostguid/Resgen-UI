import { Component, OnInit } from '@angular/core';
import { IAMService } from '../../services/IAMService';
import { FlowbiteService } from '../../services/FlowBite.service';
import { initFlowbite } from 'flowbite';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit {
  /**
   *
   */
  userImageUrl: string | null = localStorage.getItem('user.picture'); // Initialize the string property
  user:any = {};

  constructor(public auth: IAMService, private flowbiteService: FlowbiteService, public http: HttpClient) {
    let userId = localStorage.getItem('user.id');
        this.http.get<any>(environment.apiUrl+`/User/userId/` + userId).subscribe(response=>{      
          this.user = response;
        });
  }

  ngOnInit() : void { 

    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }

  logout() {
    this.auth.logout();      
  }

}
