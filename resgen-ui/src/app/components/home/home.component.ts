import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Flowbite } from '../../../flowbite-decorator';
import { HttpClient } from '@angular/common/http';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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

  isEmailVerified = true;
  userCheckLoaded = false;

  profiles: any[] = [];
  profilesTotal = 0;
  templates: any[] = [];
  selectedProfileId = '';
  selectedProfile: any = null;
  selectedTemplateId = '';
  selectedResumeUrl = '';

  // Combobox state (used when profilesTotal > 5)
  profileSearchTerm = '';
  profileResults: any[] = [];
  profileResultsLoading = false;
  profileDropdownOpen = false;
  private profileSearchSubject = new Subject<string>();
  private destroyRef = inject(DestroyRef);

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
    this.loadVerificationStatus();

    this.profileSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.fetchProfilesPage(term)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      this.profileResults = res?.items || [];
      this.profileResultsLoading = false;
    });
  }

  get hasManyProfiles(): boolean {
    return this.profilesTotal > 5;
  }

  loadVerificationStatus(): void {
    const userId = localStorage.getItem('user.id');
    if (!userId) {
      this.userCheckLoaded = true;
      return;
    }
    this.http.get<any>(`${environment.apiUrl}/User/userId/${userId}`).subscribe({
      next: user => {
        this.isEmailVerified = !!user?.is_email_verified;
        this.userCheckLoaded = true;
      },
      error: () => {
        this.userCheckLoaded = true;
      }
    });
  }

  loadProfiles(): void {
    this.profilesLoading = true;
    const userId = localStorage.getItem('user.id');
    const url = `${environment.apiUrl}/profile/user/${userId}?page=1&pageSize=5`;
    this.http.get<{ items: any[]; total: number }>(url).subscribe({
      next: res => {
        this.profiles = res?.items || [];
        this.profilesTotal = res?.total || 0;
        this.profileResults = this.profiles;
        this.profilesLoading = false;
      },
      error: () => {
        this.profiles = [];
        this.profilesTotal = 0;
        this.profileResults = [];
        this.profilesLoading = false;
      }
    });
  }

  private fetchProfilesPage(term: string) {
    this.profileResultsLoading = true;
    const userId = localStorage.getItem('user.id');
    const params = new URLSearchParams({ page: '1', pageSize: '20' });
    if (term) params.set('q', term);
    const url = `${environment.apiUrl}/profile/user/${userId}?${params}`;
    return this.http.get<{ items: any[]; total: number }>(url)
      .pipe(catchError(() => of({ items: [] as any[], total: 0 })));
  }

  onProfileSearchChange(): void {
    this.profileSearchSubject.next(this.profileSearchTerm.trim());
  }

  openProfileDropdown(): void {
    this.profileDropdownOpen = true;
    if (!this.profileSearchTerm.trim() && this.profileResults.length === 0) {
      this.profileResults = this.profiles;
    }
  }

  closeProfileDropdown(): void {
    this.profileDropdownOpen = false;
  }

  selectProfile(profile: any): void {
    this.selectedProfile = profile;
    this.selectedProfileId = profile.id;
    this.profileSearchTerm = profile.profile_name || '';
    this.profileDropdownOpen = false;
    this.onProfileChange();
  }

  clearSelectedProfile(): void {
    this.selectedProfile = null;
    this.selectedProfileId = '';
    this.profileSearchTerm = '';
    this.profileResults = this.profiles;
    this.onProfileChange();
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
    if (this.selectedProfileId) {
      const found = this.profiles.find(p => p.id === this.selectedProfileId)
                  || this.profileResults.find(p => p.id === this.selectedProfileId);
      if (found) this.selectedProfile = found;
    } else {
      this.selectedProfile = null;
    }
  }

  get canGenerate(): boolean {
    return !!this.selectedProfileId && !!this.selectedTemplateId && !this.isLoading && this.isEmailVerified;
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
      const profile = this.selectedProfile
                   || this.profiles.find(p => p.id === this.selectedProfileId);
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