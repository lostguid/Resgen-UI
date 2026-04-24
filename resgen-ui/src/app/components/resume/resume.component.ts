import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Flowbite } from '../../../flowbite-decorator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-resume',
  imports: [CommonModule, FormsModule, PdfViewerModule],
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

  pageSize = 8;
  currentPage = 1;
  totalItems = 0;
  searchTerm = '';
  lastSubmittedTerm = '';
  hasLoadedOnce = false;

  private searchSubject = new Subject<string>();
  private destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.currentPage = 1;
        return this.fetchPaged(term, 1);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => this.applyResults(res));

    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.currentPage = page;
    this.fetchPaged(this.searchTerm.trim(), page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.applyResults(res));
  }

  refresh(): void {
    this.loadPage(this.currentPage);
  }

  private fetchPaged(term: string, page: number) {
    this.isLoading = true;
    const userId = localStorage.getItem('user.id');
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(this.pageSize)
    });
    if (term) params.set('q', term);
    const url = `${environment.apiUrl}/Resume/user/${userId}?${params}`;
    return this.http.get<{ items: any[]; total: number }>(url)
      .pipe(catchError(() => of({ items: [], total: 0 })));
  }

  private applyResults(res: { items: any[]; total: number }): void {
    this.resumes = res.items || [];
    this.totalItems = res.total || 0;
    this.isLoading = false;
    this.lastSubmittedTerm = this.searchTerm.trim();
    this.hasLoadedOnce = true;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pageStartIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm.trim());
  }

  clearSearch(): void {
    if (!this.searchTerm && !this.lastSubmittedTerm) return;
    this.searchTerm = '';
    this.loadPage(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;
    this.loadPage(page);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
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
        if (this.selectedResumeId === id) {
          this.selectedResumeUrl = null;
          this.selectedResumeId = null;
        }
        const wasLastOnPage = this.resumes.length === 1 && this.currentPage > 1;
        if (wasLastOnPage) {
          this.loadPage(this.currentPage - 1);
        } else {
          this.refresh();
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
