import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flowbite } from '../../../flowbite-decorator';
import { HttpClient } from '@angular/common/http';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [CommonModule, PdfViewerModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

@Flowbite()
export class HomeComponent {

  token: string | null = null;
  isLoggedIn: boolean = false;
  isAuthenticated: boolean = false;

  profiles: any[] = [];
  templates: any[] = [];
  selectedResumeUrl: string = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProfiles();
    this.loadTemplates();
    this.viewResume('');
  }

  loadProfiles(): void {
    this.http.get<any[]>(`${environment.apiUrl}/profile/user/` + localStorage.getItem('user.id')).subscribe(data => {
      this.profiles = data;
      this.populateDropdown('profileDropdown', this.profiles);
    });
  }

  loadTemplates(): void {
    this.http.get<any[]>('API_ENDPOINT_FOR_TEMPLATES').subscribe(data => {
      this.templates = data;
      this.populateDropdown('templateDropdown', this.templates);
    });
  }

  populateDropdown(dropdownId: string, items: any[]): void {
    const dropdown = document.getElementById(dropdownId) as HTMLSelectElement;
    dropdown.innerHTML = '';
    if(dropdownId === 'profileDropdown') {
      items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.text = item.profile_name;
        dropdown.add(option);
      });
    }
    else if(dropdownId === 'templateDropdown') {
      items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.text = item.name;
        dropdown.add(option);
      });
    }
    
  }

  viewResume(url: string): void {
    this.selectedResumeUrl = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
    console.log('Viewing resume:', this.selectedResumeUrl);
  }
}