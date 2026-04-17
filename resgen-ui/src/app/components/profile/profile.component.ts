import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { Flowbite } from '../../../flowbite-decorator';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
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
  modalTitle = '';
  modalMessage = '';
  modalClass = '';
  modalIcon = '';

  pageSize = 10;
  currentPage = 1;

  constructor(private fb: FormBuilder, public router: Router, private http: HttpClient) {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/profile/user/` + localStorage.getItem('user.id')).subscribe({
      next: data => {
        this.profiles = data || [];
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: () => {
        this.profiles = [];
        this.currentPage = 1;
        this.isLoading = false;
      }
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.profiles.length / this.pageSize));
  }

  get pagedProfiles(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.profiles.slice(start, start + this.pageSize);
  }

  get pageStartIndex(): number {
    if (this.profiles.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.profiles.length);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
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
        this.profiles = this.profiles.filter((profile: any) => profile.id !== id);
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
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

  onModalClose() {
    this.showModal = false;
    this.router.navigate(['/profiles']);
  }

}