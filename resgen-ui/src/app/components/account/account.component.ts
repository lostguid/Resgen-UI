import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IAMService } from '../../services/IAMService';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-account',
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {

  user:any = {};

  constructor(public auth: IAMService, public auth0: AuthService, public http: HttpClient) {
    let userId = localStorage.getItem('user.id');
    this.http.get<any>(environment.apiUrl+`/User/userId/` + userId).subscribe(response=>{      
      this.user = response;
    });
  }

  ngonInit() {
    
  }

}
