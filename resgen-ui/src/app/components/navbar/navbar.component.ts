import { Component } from '@angular/core';
import { IAMService } from '../../services/IAMService';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // Corrected property name
})
export class NavbarComponent {
  userImageUrl: string | null = localStorage.getItem('user.picture'); // Initialize the string property
  metadata: any;

  constructor(public auth: IAMService, public auth0: AuthService, public http: HttpClient){

  }  


  ngonInit() {
    this.userImageUrl = localStorage.getItem('user.picture'); // Set the string property

    this.http.get(
      encodeURI(`http://localhost:5039/api/User`)
    );
  }

  logout() {
    this.auth.logout();
    

    // this.auth0.user$
    // .pipe(
    //   concatMap((user) =>
    //     // Use HttpClient to make the call
    //     this.http.get(
    //       encodeURI(`http://localhost:5039/api/User`)
    //     )
    //   ),
    //   map((user: any) => user.user_metadata),
    //   tap((meta) => (this.metadata = meta))
    // )
    // .subscribe();
      
  }
}