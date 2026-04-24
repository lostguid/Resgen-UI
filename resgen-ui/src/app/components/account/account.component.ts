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

  user: any = {};
  isLoading = true;
  userImageUrl: string | null = localStorage.getItem('user.picture');

  constructor(public auth: IAMService, public auth0: AuthService, public http: HttpClient, private flowbiteService: FlowbiteService) {
    let userId = localStorage.getItem('user.id');
    this.http.get<any>(environment.apiUrl + `/User/userId/` + userId).subscribe({
      next: response => {
        this.user = response || {};
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onUserImageError(): void {
    this.userImageUrl = null;
    localStorage.removeItem('user.picture');
  }

  get initials(): string {
    const source = (this.user?.name || this.user?.email || '').trim();
    if (!source) return '?';
    const parts = source.split(/\s+/);
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase() || source[0].toUpperCase();
  }

  logout() {
    this.auth.logout();
  }
}
