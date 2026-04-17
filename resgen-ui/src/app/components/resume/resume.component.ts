import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Flowbite } from '../../../flowbite-decorator';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-resume',
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css']
})
@Flowbite()
export class ResumeComponent implements OnInit {
  resumes: any[] = [];
  selectedResumeUrl: string | null = null;
  selectedResumeId: number | null = null;
  isLoading = true;

  showDeleteModal = false;
  resumeToDelete: any = null;
  isDeleting = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadResumes();
  }

  loadResumes(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/Resume/user/`+localStorage.getItem('user.id')).subscribe({
      next: data => {
        this.resumes = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.resumes = [];
        this.isLoading = false;
      }
    });
  }

  viewResume(resume: any): void {
    this.selectedResumeUrl = resume.resume_blob_url;
    this.selectedResumeId = resume.id;
  }

  downloadResume(url: string, name : string): void {
    const link = document.createElement('a');
    link.href = url;
    if (!name.endsWith('.pdf')) {
      name += '.pdf';
    }
    link.target = '_blank';
    link.download = name;
    link.click();
  }

  askDeleteResume(resume: any): void {
    this.resumeToDelete = resume;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    if (this.isDeleting) return;
    this.showDeleteModal = false;
    this.resumeToDelete = null;
  }

  confirmDelete(): void {
    if (!this.resumeToDelete || this.isDeleting) return;
    const id = this.resumeToDelete.id;
    this.isDeleting = true;
    this.http.delete(`${environment.apiUrl}/Resume/${id}`).subscribe({
      next: () => {
        this.resumes = this.resumes.filter(resume => resume.id !== id);
        if (this.selectedResumeId === id) {
          this.selectedResumeUrl = null;
          this.selectedResumeId = null;
        }
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.resumeToDelete = null;
      },
      error: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.resumeToDelete = null;
      }
    });
  }
}
