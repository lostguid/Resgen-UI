import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { environment } from '../../../../environments/environment';
import { Flowbite } from '../../../../flowbite-decorator';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_email_verified: boolean;
  last_active_in_utc: string;
  tokens_used: number;
}

interface AdminProfile {
  id: string;
  profile_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  school_name: string;
  level_of_education: string;
  created_at_in_utc: string;
  experiences: any[];
  certifications: any[];
  leadership: any[];
}

interface AdminResume {
  id: string;
  user_id: string;
  template_id: string;
  name: string;
  resume_blob_url: string;
  created_at_utc: string;
}

interface UserDetailResponse {
  user: AdminUser;
  profiles: AdminProfile[];
  resumes: AdminResume[];
}

@Component({
  selector: 'app-admin-user-detail',
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.css']
})
@Flowbite()
export class AdminUserDetailComponent implements OnInit {
  userId = '';
  user: AdminUser | null = null;
  profiles: AdminProfile[] = [];
  resumes: AdminResume[] = [];
  isLoading = true;
  error: string | null = null;

  expandedProfileId: string | null = null;
  selectedResumeUrl: string | null = null;
  selectedResumeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.userId) {
      this.error = 'Missing user id.';
      this.isLoading = false;
      return;
    }
    this.loadDetail();
  }

  loadDetail(): void {
    this.isLoading = true;
    this.error = null;
    this.http.get<UserDetailResponse>(`${environment.apiUrl}/Admin/users/${encodeURIComponent(this.userId)}`).subscribe({
      next: data => {
        this.user = data.user;
        this.profiles = (data.profiles || []).slice().sort((a, b) =>
          new Date(b.created_at_in_utc || 0).getTime() - new Date(a.created_at_in_utc || 0).getTime()
        );
        this.resumes = (data.resumes || []).slice().sort((a, b) =>
          new Date(b.created_at_utc || 0).getTime() - new Date(a.created_at_utc || 0).getTime()
        );
        this.isLoading = false;
      },
      error: err => {
        this.error = err?.status === 403
          ? 'Forbidden — admin role required.'
          : err?.status === 404
            ? 'User not found.'
            : 'Failed to load user detail.';
        this.isLoading = false;
      }
    });
  }

  back(): void {
    this.router.navigate(['/admin']);
  }

  toggleProfile(id: string): void {
    this.expandedProfileId = this.expandedProfileId === id ? null : id;
  }

  viewResume(resume: AdminResume): void {
    this.selectedResumeUrl = resume.resume_blob_url;
    this.selectedResumeId = resume.id;
  }

  closeResumePreview(): void {
    this.selectedResumeUrl = null;
    this.selectedResumeId = null;
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString();
  }
}
