import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Flowbite } from '../../../flowbite-decorator';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../Pipes/safe-url.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-resume',
  imports: [CommonModule, SafeUrlPipe, PdfViewerModule],
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css']
})
@Flowbite()
export class ResumeComponent implements OnInit {
  resumes: any[] = [];
  selectedResumeUrl: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadResumes();
  }

  loadResumes(): void {
    this.http.get<any[]>(`${environment.apiUrl}/Resume/user/`+localStorage.getItem('user.id')).subscribe(data => {
      this.resumes = data;
    });
  }

  viewResume(url: string): void {
    this.selectedResumeUrl = url;
  }

  downloadResume(url: string, name : string): void {
    const link = document.createElement('a');
    link.href = url;
    if (!name.endsWith('.pdf')) {
      name += '.pdf';
    }
    link.target = '_blank'; // Open link in a new tab
    link.download = name;
    link.click();
  }

  deleteResume(id: number): void {
    this.http.delete(`${environment.apiUrl}/Resume/${id}`).subscribe(() => {
      this.resumes = this.resumes.filter(resume => resume.id !== id);
      if (this.selectedResumeUrl && this.selectedResumeUrl.includes(id.toString())) {
        this.selectedResumeUrl = null;
      }
    });
  }
}
