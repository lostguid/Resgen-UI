import { Component } from '@angular/core';
import { Flowbite } from '../../../flowbite-decorator';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../Pipes/safe-url.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-resume',
  imports: [CommonModule, SafeUrlPipe,PdfViewerModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.css'
})
@Flowbite()
export class ResumeComponent {
  resumes = [
    { id: 1, name: 'Resume 1', url: 'assets/resume1.pdf' },
    { id: 2, name: 'Resume 2', url: 'assets/resume2.pdf' },
    { id: 3, name: 'Resume 3', url: 'assets/resume3.pdf' }
  ];

  selectedResumeUrl: string | null = null;

  viewResume(url: string) {
    this.selectedResumeUrl = url;
    console.log('Viewing resume:', this.selectedResumeUrl);
  }

  deleteResume(id: number) {
    this.resumes = this.resumes.filter(resume => resume.id !== id);
    if (this.selectedResumeUrl && this.selectedResumeUrl.includes(`resume${id}.pdf`)) {
      this.selectedResumeUrl = null;
    }
  }

  downloadResume(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'resume.pdf';
    link.click();
  }
}
