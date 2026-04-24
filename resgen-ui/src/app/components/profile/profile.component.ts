import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { Flowbite } from '../../../flowbite-decorator';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalComponent],
})
@Flowbite()
export class ProfileComponent implements OnInit {
  profiles: any = [];
  editForm: FormGroup;
  isLoading = true;
  showModal = false;
  showDeleteModal = false;
  profileToDelete: any = null;
  isDeleting = false;

  showCloneModal = false;
  cloneSourceProfile: any = null;
  cloneNewName = '';
  isCloning = false;
  cloneError: string | null = null;
  modalTitle = '';
  modalMessage = '';
  modalClass = '';
  modalIcon = '';

  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  searchTerm = '';
  lastSubmittedTerm = '';
  hasLoadedOnce = false;

  private searchSubject = new Subject<string>();
  private destroyRef = inject(DestroyRef);

  constructor(private fb: FormBuilder, public router: Router, private http: HttpClient) {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
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

  loadPage(page: number) {
    this.currentPage = page;
    this.fetchPaged(this.searchTerm.trim(), page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.applyResults(res));
  }

  refresh() {
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
    const url = `${environment.apiUrl}/profile/user/${userId}?${params}`;
    return this.http.get<{ items: any[]; total: number }>(url)
      .pipe(catchError(() => of({ items: [], total: 0 })));
  }

  private applyResults(res: { items: any[]; total: number }) {
    this.profiles = res.items || [];
    this.totalItems = res.total || 0;
    this.isLoading = false;
    this.lastSubmittedTerm = this.searchTerm.trim();
    this.hasLoadedOnce = true;
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm.trim());
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

  clearSearch() {
    if (!this.searchTerm && !this.lastSubmittedTerm) return;
    this.searchTerm = '';
    this.loadPage(1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;
    this.loadPage(page);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  getInitials(profile: any): string {
    const source = (profile?.profile_name || profile?.name || '').trim();
    if (!source) return '?';
    const parts = source.split(/\s+/);
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase() || '?';
  }

  startEdit(profile: any) {
    this.router.navigate(['/profiles/edit/', profile.id]);
  }

  askDeleteProfile(profile: any) {
    this.profileToDelete = profile;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    if (this.isDeleting) return;
    this.showDeleteModal = false;
    this.profileToDelete = null;
  }

  confirmDelete() {
    if (!this.profileToDelete || this.isDeleting) return;
    const id = this.profileToDelete.id;
    this.isDeleting = true;
    this.http.delete(`${environment.apiUrl}/profile/${id}`).subscribe(
      () => {
        const wasLastOnPage = this.profiles.length === 1 && this.currentPage > 1;
        if (wasLastOnPage) {
          this.loadPage(this.currentPage - 1);
        } else {
          this.refresh();
        }
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.profileToDelete = null;
        this.showModal = true;
        this.modalTitle = 'Success';
        this.modalMessage = 'Profile deleted successfully';
      },
      () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.profileToDelete = null;
        this.showModal = true;
        this.modalTitle = 'Error';
        this.modalMessage = 'Error deleting profile';
      }
    );
  }

  addProfile() {
    this.router.navigate(['/profiles/create']);
  }

  askCloneProfile(profile: any) {
    this.cloneSourceProfile = profile;
    this.cloneNewName = `${profile?.profile_name ?? 'Profile'} (Copy)`;
    this.cloneError = null;
    this.showCloneModal = true;
  }

  cancelClone() {
    if (this.isCloning) return;
    this.showCloneModal = false;
    this.cloneSourceProfile = null;
    this.cloneNewName = '';
    this.cloneError = null;
  }

  confirmClone() {
    const newName = this.cloneNewName.trim();
    if (!this.cloneSourceProfile || !newName || this.isCloning) return;

    this.isCloning = true;
    this.cloneError = null;

    this.http.get<any>(`${environment.apiUrl}/profile/${this.cloneSourceProfile.id}`).subscribe({
      next: source => {
        const payload = {
          ...(source || {}),
          id: '0',
          profile_name: newName,
          user_id: localStorage.getItem('user.id'),
          created_at_in_utc: new Date().toISOString()
        };

        this.http.post(`${environment.apiUrl}/profile`, payload).subscribe({
          next: () => {
            this.isCloning = false;
            this.showCloneModal = false;
            this.cloneSourceProfile = null;
            this.cloneNewName = '';
            this.refresh();
            this.showModal = true;
            this.modalTitle = 'Success';
            this.modalMessage = 'Profile cloned successfully';
          },
          error: () => {
            this.isCloning = false;
            this.cloneError = 'Could not clone the profile. Please try again.';
          }
        });
      },
      error: () => {
        this.isCloning = false;
        this.cloneError = 'Could not load the source profile.';
      }
    });
  }

  onModalClose() {
    this.showModal = false;
    this.router.navigate(['/profiles']);
  }

}