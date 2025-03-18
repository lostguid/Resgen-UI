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
  showModal = false;
  showDeleteModal = false;
  modalTitle = '';
  modalMessage = '';
  modalClass = '';
  modalIcon = '';

  constructor(private fb: FormBuilder, public router: Router, private http: HttpClient) {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    this.http.get<any[]>(`${environment.apiUrl}/profile/user/` + localStorage.getItem('user.id')).subscribe(data => {
      this.profiles = data;
    });
  }

  startEdit(profile: any) {
    this.router.navigate(['/profiles/edit/', profile.id]);
  }

  deleteProfile(id: number) {
    const confirmed = confirm('Are you sure you want to delete this profile?');
    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/profile/${id}`).subscribe(
        response => {
          this.profiles = this.profiles.filter((profile: any) => profile.id !== id);
          this.showModal = true;
          this.modalTitle = 'Success';
          this.modalMessage = 'Profile deleted successfully';
          // this.modalClass = 'bg-green-500';
          // this.modalIcon = 'M5 13l4 4L19 7';
        },
        error => {
          this.showModal = true;
          this.modalTitle = 'Error';
          this.modalMessage = 'Error deleting profile';
          // this.modalClass = 'bg-red-500';
          // this.modalIcon = 'M6 18L18 6M6 6l12 12';
        }

      );
    }
  }

  addProfile() {
    this.router.navigate(['/profiles/create']);
  }

  onModalClose() {
    this.showModal = false;
    this.router.navigate(['/profiles']);
  }

}