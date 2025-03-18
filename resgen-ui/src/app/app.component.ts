import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import type { Event } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { IAMService } from './services/IAMService';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { FlowbiteService } from './services/FlowBite.service';
import { AuthService } from '@auth0/auth0-angular';
import { Flowbite } from '../flowbite-decorator';
import { delay, of, switchMap } from 'rxjs';
import { TabService } from './services/tab.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
@Flowbite()
export class AppComponent implements OnInit {
  title = 'resgen-ui';
  selectedTab: string = 'home';
  isAuthenticated: boolean = false;
  isLoading: boolean = true; // Add isLoading property

  userImageUrl: string | null = localStorage.getItem('user.picture');
  user: any = {};
  excludedRoutes = ['/welcome']; // Add routes where `isAuthenticated` is not required

  constructor(
    private eRef: ElementRef,
    private router: Router,
    public auth: IAMService,
    private http: HttpClient,
    private flowbiteService: FlowbiteService,
    private auth0: AuthService,
    private tabService: TabService
  ) {
    this.tabService.selectedTab$.subscribe(tab => {
      this.selectedTab = tab;
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const sidebar = document.getElementById('logo-sidebar');
    if (sidebar && !this.eRef.nativeElement.contains(event.target as Node)) {
      sidebar.classList.add('-translate-x-full');
    }
  }

  shouldCheckAuthentication(): boolean {    
    return !this.excludedRoutes.includes(this.router.url);
  }

  ngOnInit(): void {
    this.auth0.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        if (this.isAuthenticated) {
          of(null)
            .pipe(
              delay(1),
              switchMap(() =>
                this.http.get<any>(
                  environment.apiUrl +
                    `/User/userId/` +
                    localStorage.getItem('user.id')
                )
              )
            )
            .subscribe(response => {
              this.user = response;
              this.userImageUrl = localStorage.getItem('user.picture');
              this.isLoading = false; // Set isLoading to false after data is loaded
            });
        } else {
          this.isLoading = false; // Set isLoading to false if not authenticated
        }
      },
      () => {
        this.isLoading = false; // Set isLoading to false on error
      }
    );
  }

  login() {
    this.auth.login();
  }

  openHomeTab() {
    this.selectedTab = 'home';
    this.router.navigate(['/home']);
    this.closeSidebar();
  }

  openProfilesTab() {
    this.selectedTab = 'profiles';
    this.router.navigate(['/profiles']);
    this.closeSidebar();
  }

  openResumesTab() {
    this.selectedTab = 'resumes';
    this.router.navigate(['/resumes']);
    this.closeSidebar();
  }

  openAccountTab() {
    this.selectedTab = 'account';
    this.router.navigate(['/account']);
    this.closeSidebar();
  }

  closeSidebar() {
    const toggleButton = document.getElementById('side-bar-button');
    if (toggleButton && !this.isSidebarHidden()) {
      toggleButton.dispatchEvent(new Event('click'));
    }
  }

  isSidebarHidden(): boolean {
    const sidebar = document.querySelector('[aria-label="Sidebar"]');
    if (sidebar) {
      return sidebar.classList.contains('-translate-x-full');
    }
    return true;
  }

  logout() {
    this.auth.logout();
  }
}
