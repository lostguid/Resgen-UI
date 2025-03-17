import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IAMService } from '../../services/IAMService';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FlowbiteService } from '../../services/FlowBite.service';
import { initFlowbite } from 'flowbite';
import { Flowbite } from '../../../flowbite-decorator';

@Component({
  selector: 'app-account',
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
@Flowbite()
export class AccountComponent {

  user:any = {};

  constructor(public auth: IAMService, public auth0: AuthService, public http: HttpClient, private flowbiteService: FlowbiteService) {
    let userId = localStorage.getItem('user.id');
    this.http.get<any>(environment.apiUrl+`/User/userId/` + userId).subscribe(response=>{      
      this.user = response;
      //console.log(response);
    });
  }

  ngonInit() {
  }

}
