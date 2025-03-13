import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flowbite } from '../../../flowbite-decorator';
import { HttpClient } from '@angular/common/http';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, PdfViewerModule, FormsModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

@Flowbite()
export class HomeComponent implements AfterViewInit {
  isLoading: boolean = false;
  token: string | null = null;
  isLoggedIn: boolean = false;
  isAuthenticated: boolean = false;

  profiles: any[] = [];
  templates: any[] = [];
  selectedResumeUrl: string = '';
  showSaveTextbox = false;
  fileName: string = '';
  //selectedResumeUrl: string = 'https://storageresgen.blob.core.windows.net/resgen-assets/resume_example2.pdf';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadProfiles();
    this.loadTemplates();
    this.viewResume('');
  }

  ngAfterViewInit(): void {
    const templateDropdown = document.getElementById('templateDropdown') as HTMLSelectElement;
    if (templateDropdown) {
      templateDropdown.addEventListener('change', (event) => {
        const selectedTemplateId = (event.target as HTMLSelectElement).value;
        const selectedTemplate = this.templates.find(template => template.id === selectedTemplateId);
        if (selectedTemplate) {
          this.viewResume(selectedTemplate.template_sample_url);
        }
      });
    }
  }

  loadProfiles(): void {
    this.http.get<any[]>(`${environment.apiUrl}/profile/user/` + localStorage.getItem('user.id')).subscribe(data => {
      this.profiles = data;
      this.populateDropdown('profileDropdown', this.profiles);
    });
  }

  loadTemplates(): void {
    this.http.get<any[]>(`${environment.apiUrl}/Template`).subscribe(data => {
      this.templates = data;
      this.populateDropdown('templateDropdown', this.templates);
      if (this.templates.length > 0) {
        this.viewResume(this.templates[0].template_sample_url);
      }
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

  generateResume() {
    this.isLoading = true;
    this.showSaveTextbox = false;
    this.fileName = '';
    const profileId = (document.getElementById('profileDropdown') as HTMLSelectElement).value;
    const templateId = (document.getElementById('templateDropdown') as HTMLSelectElement).value;

    if (profileId && templateId) {
      this.http.get(`${environment.apiUrl}/Resume/generate-resume?profileId=${profileId}&templateId=${templateId}&userId=${localStorage.getItem('user.id')}`, { responseType: 'blob' })
        .subscribe(response => {
          this.isLoading = false;
          const url = window.URL.createObjectURL(response);
          this.selectedResumeUrl = url;
        }, error => {
          this.isLoading = false;
          console.error('Error fetching the resume:', error);
        });
    } else {
      alert('Please select both profile and template.');
    }
  }

  saveResume() {
    const profileId = (document.getElementById('profileDropdown') as HTMLSelectElement).value;
    const templateId = (document.getElementById('templateDropdown') as HTMLSelectElement).value;
  
    if (this.selectedResumeUrl) {
      this.isLoading = true;
      fetch(this.selectedResumeUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.readAsArrayBuffer(blob);
          reader.onloadend = () => {
            const byteArray = new Uint8Array(reader.result as ArrayBuffer);
            const base64String = btoa(String.fromCharCode(...byteArray));
            this.http.post(`${environment.apiUrl}/Resume`, {
              name: this.fileName,
              user_id: localStorage.getItem('user.id'),
              resume_blob_byte_array: base64String,
              created_at: new Date().toISOString(),
              profile_id: profileId,
              template_id: templateId
            }).subscribe(response => {
              this.isLoading = false;
              //('Resume saved successfully!');
              this.showSaveTextbox = false;
              this.router.navigate(['/resumes']);
            }, error => {
              this.isLoading = false;
              this.showSaveTextbox = false;
              //console.error('Error saving the resume:', error);
            });
          };
        })
        .catch(error => {
          this.isLoading = false;
          console.error('Error fetching the resume blob:', error);
        });
    } else {
      alert('No resume available to save.');
    }
  }

  toggleSaveTextbox() {
    this.showSaveTextbox = !this.showSaveTextbox;
  }

  downloadResume() {
    if (this.selectedResumeUrl) {
      const link = document.createElement('a');
      link.href = this.selectedResumeUrl;
      link.download = 'resume.pdf';
      link.target = '_blank'; // Open link in a new tab
      link.click();
    } else {
      alert('No resume available to download.');
    }
  }

  viewResume(url: string): void {
    this.selectedResumeUrl = url;
    console.log('Viewing resume:', this.selectedResumeUrl);
  }
}