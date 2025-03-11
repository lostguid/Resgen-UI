import { Component } from '@angular/core';
import { Flowbite } from '../../../flowbite-decorator';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateProfileComponent } from './create-profile/create-profile.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
@Flowbite()
export class ProfileComponent {
  profiles: any[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Michael Johnson' }
  ];

  editForm: FormGroup;
  currentProfileId: number | null = null;
  currentProfile: any | null = null;

  constructor(private fb: FormBuilder, public router: Router) {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  startEdit(profile: any) {
    this.router.navigate(['/profiles/edit']);
  }

  deleteProfile(id: number) {
    this.profiles = this.profiles.filter(profile => profile.id !== id);
  }

  addProfile() {
    // const newId = this.profiles.length ? Math.max(...this.profiles.map(p => p.id)) + 1 : 1;
    // this.profiles.push({ id: newId, name: 'New Profile' });
    this.router.navigate(['/profiles/create']);
  }

  viewProfile(profile: any) {
    this.currentProfile = profile;
  }

  closeModal() {
    this.currentProfile = null;
  }

}
