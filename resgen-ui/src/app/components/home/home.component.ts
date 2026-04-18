import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flowbite } from '../../../flowbite-decorator';
import { HttpClient } from '@angular/common/http';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TabService } from '../../services/tab.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, PdfViewerModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

@Flowbite()
export class HomeComponent {
  isLoading = false;
  isSaving = false;
  isGenerated = false;
  profilesLoading = true;
  templatesLoading = true;
  errorMessage = '';

  profiles: any[] = [];
  templates: any[] = [];
  selectedProfileId = '';
  selectedTemplateId = '';
  selectedResumeUrl = '';

  showSaveTextbox = false;
  fileName = '';

  advancedOpen = false;
  jobDescription = '';
  tailorStrength = 5;

  showMismatchModal = false;
  mismatchReason = '';

  constructor(private http: HttpClient, private router: Router, private tabService: TabService) {}

  ngOnInit(): void {
    this.loadProfiles();
    this.loadTemplates();
  }

  loadProfiles(): void {
    this.profilesLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/profile/user/` + localStorage.getItem('user.id')).subscribe({
      next: data => {
        this.profiles = data || [];
        this.profilesLoading = false;
      },
      error: () => {
        this.profiles = [];
        this.profilesLoading = false;
      }
    });
  }

  loadTemplates(): void {
    this.templatesLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/Template`).subscribe({
      next: data => {
        this.templates = data || [];
        this.templatesLoading = false;
        if (this.templates.length > 0) {
          this.selectedTemplateId = this.templates[0].id;
          this.selectedResumeUrl = this.templates[0].template_sample_url;
        }
      },
      error: () => {
        this.templates = [];
        this.templatesLoading = false;
      }
    });
  }

  onTemplateChange(): void {
    const selectedTemplate = this.templates.find(t => t.id === this.selectedTemplateId);
    if (selectedTemplate) {
      this.selectedResumeUrl = selectedTemplate.template_sample_url;
    }
    this.isGenerated = false;
    this.showSaveTextbox = false;
  }

  onProfileChange(): void {
    this.isGenerated = false;
    this.showSaveTextbox = false;
  }

  get canGenerate(): boolean {
    return !!this.selectedProfileId && !!this.selectedTemplateId && !this.isLoading;
  }

  get isAdvancedActive(): boolean {
    return this.advancedOpen && this.jobDescription.trim().length > 0;
  }

  toggleAdvanced(): void {
    this.advancedOpen = !this.advancedOpen;
  }

  closeMismatchModal(): void {
    this.showMismatchModal = false;
    this.mismatchReason = '';
  }

  generateResume(): void {
    if (!this.canGenerate) return;
    this.isLoading = true;
    this.isGenerated = false;
    this.showSaveTextbox = false;
    this.fileName = '';
    this.errorMessage = '';

    if (this.isAdvancedActive) {
      this.generateTailored();
    } else {
      this.generateStandard();
    }
  }

  private generateStandard(): void {
    this.http.get(`${environment.apiUrl}/Resume/generate-resume?profileId=${this.selectedProfileId}&templateId=${this.selectedTemplateId}&userId=${localStorage.getItem('user.id')}`, { responseType: 'blob' })
      .subscribe({
        next: response => {
          this.isLoading = false;
          this.isGenerated = true;
          this.selectedResumeUrl = window.URL.createObjectURL(response);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Could not generate the resume. Please try again.';
        }
      });
  }

  private generateTailored(): void {
    const body = {
      userId: localStorage.getItem('user.id'),
      profileId: this.selectedProfileId,
      templateId: this.selectedTemplateId,
      jobDescription: this.jobDescription.trim(),
      tailorStrength: this.tailorStrength
    };

    this.http.post(`${environment.apiUrl}/Resume/generate-tailored`, body, { responseType: 'blob' })
      .subscribe({
        next: response => {
          this.isLoading = false;
          this.isGenerated = true;
          this.selectedResumeUrl = window.URL.createObjectURL(response);
        },
        error: async err => {
          this.isLoading = false;
          if (err.status === 422 && err.error instanceof Blob) {
            try {
              const text = await err.error.text();
              const parsed = JSON.parse(text);
              this.mismatchReason = parsed?.reason || '';
              this.showMismatchModal = true;
              return;
            } catch {
              // fall through to generic error
            }
          }
          this.errorMessage = 'Could not generate the tailored resume. Please try again.';
        }
      });
  }

  saveResume(): void {
    if (!this.selectedResumeUrl || !this.fileName.trim()) return;
    this.isSaving = true;
    fetch(this.selectedResumeUrl)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onloadend = () => {
          const byteArray = new Uint8Array(reader.result as ArrayBuffer);
          const base64String = btoa(String.fromCharCode(...byteArray));
          this.http.post(`${environment.apiUrl}/Resume`, {
            name: this.fileName.trim(),
            user_id: localStorage.getItem('user.id'),
            resume_blob_byte_array: base64String,
            created_at: new Date().toISOString(),
            profile_id: this.selectedProfileId,
            template_id: this.selectedTemplateId
          }).subscribe({
            next: () => {
              this.isSaving = false;
              this.showSaveTextbox = false;
              this.tabService.setSelectedTab('resumes');
              this.router.navigate(['/resumes']);
            },
            error: () => {
              this.isSaving = false;
              this.errorMessage = 'Could not save the resume. Please try again.';
            }
          });
        };
      })
      .catch(() => {
        this.isSaving = false;
        this.errorMessage = 'Could not read the generated resume.';
      });
  }

  toggleSaveTextbox(): void {
    this.showSaveTextbox = !this.showSaveTextbox;
    if (this.showSaveTextbox && !this.fileName) {
      const profile = this.profiles.find(p => p.id === this.selectedProfileId);
      const template = this.templates.find(t => t.id === this.selectedTemplateId);
      if (profile && template) {
        this.fileName = `${profile.profile_name} - ${template.name}`;
      }
    }
  }

  downloadResume(): void {
    if (!this.selectedResumeUrl) return;
    const link = document.createElement('a');
    link.href = this.selectedResumeUrl;
    link.download = (this.fileName.trim() || 'resume') + '.pdf';
    link.target = '_blank';
    link.click();
  }
}