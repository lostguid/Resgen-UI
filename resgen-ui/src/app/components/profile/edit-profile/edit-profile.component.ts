import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Datepicker } from 'flowbite-datepicker';
import { CommonModule } from '@angular/common';
import { Flowbite } from '../../../../flowbite-decorator';
import { first } from 'rxjs';
import { ModalComponent } from '../../modal/modal.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  imports: [CommonModule, ReactiveFormsModule, ModalComponent]
})

@Flowbite()
export class EditProfileComponent implements OnInit {
  editForm: FormGroup;
  profileId: string;

  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.editForm = this.fb.group({
      profileName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]],
      linkedin: ['', [Validators.required, Validators.pattern('^(https?:\/\/)?(www\.)?linkedin\.com\/.*$')]],
      school: ['', Validators.required],
      loe: ['', Validators.required],
      experiences: this.fb.array([])
    });
    this.profileId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    this.loadProfile();
  }

  ngAfterViewInit() {
    this.initializeDatepickers();
  }

  loadProfile() {
    this.http.get<any>(`${environment.apiUrl}/profile/${this.profileId}`).subscribe(data => {
      this.editForm.patchValue({
        profileName: data.profile_name,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        email: data.email,
        linkedin: data.linkedin_url,
        school: data.school_name,
        loe: data.level_of_education
      });
      this.setExperiences(data.experiences);
    });
  }

  setExperiences(experiences: any[]) {
    const experienceFormGroups = experiences.map(exp => this.fb.group({
      companyName: [exp.company_name, Validators.required],
      title: [exp.title, Validators.required],
      startDate: [exp.start_date_in_utc, Validators.required],
      endDate: [exp.end_date_in_utc, Validators.required],
      skillsUsed: [exp.skills_used.join(', '), Validators.required]
    }));
    const experienceFormArray = this.fb.array(experienceFormGroups);
    this.editForm.setControl('experiences', experienceFormArray);
    this.initializeDatepickers();
  }

  initializeDatepickers() {
    const datepickerElements = document.querySelectorAll('[datepicker]');
    datepickerElements.forEach((el) => {
      const datepicker = new Datepicker(el as HTMLElement, {
        // Optional: Add any datepicker options here
      });
      el.addEventListener('changeDate', (event: any) => {
        const input = event.target as HTMLInputElement;
        const formControlName = input.getAttribute('id');
        if (formControlName) {
          const splitString = formControlName.replace(/(\d+)$/, '.$1').replace(/(.*)\.(\d+)/, '$2.$1');
          const control = this.editForm.get('experiences.'+splitString);          
          if (control) {
            control.setValue(input.value);
            control.markAsDirty();
            control.updateValueAndValidity();
          }
        }
      });
    });
  }

  get experiences() {
    return this.editForm.get('experiences') as FormArray;
  }

  addExperience() {
    this.experiences.push(this.fb.group({
      companyName: ['', Validators.required],
      title: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      skillsUsed: ['', Validators.required]
    }));
    setTimeout(() => this.initializeDatepickers(), 0); // Reinitialize datepickers for new elements
  }

  removeExperience(index: number) {
    this.experiences.removeAt(index);
  }

  getErrorMessage(controlName: string): string {
    const control = this.editForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Field cannot be empty';
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid phone number format';
    }
    return 'Invalid Input';
  }

  getExperienceErrorMessage(experienceIndex: number, controlName: string): string {
    const experience = this.experiences.at(experienceIndex);
    const control = experience?.get(controlName);
    if (control?.hasError('required')) {
      return 'Field cannot be empty';
    }
    return 'Invalid Input';
  }

  onSubmit() {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      const formattedData = {
        id: this.profileId,
        profile_name: formValue.profileName,
        name: formValue.firstName + ' ' + formValue.lastName,
        first_name: formValue.firstName,
        last_name: formValue.lastName,
        user_id: localStorage.getItem('user.id'),
        created_at_in_utc: new Date().toISOString(), // Current timestamp
        email: formValue.email,
        phone: formValue.phone,
        linkedin_url: formValue.linkedin,
        school_name: formValue.school,
        level_of_education: formValue.loe,
        experiences: formValue.experiences.map((exp: any) => ({
          company_name: exp.companyName,
          title: exp.title,
          start_date_in_utc: exp.startDate,
          end_date_in_utc: exp.endDate,
          skills_used: exp.skillsUsed.split(',').map((skill: string) => skill.trim())
        }))
      };

      this.http.put(`${environment.apiUrl}/profile/${this.profileId}`, formattedData).subscribe(
        response => {
          this.modalTitle = 'Success';
          this.modalMessage = 'Profile updated successfully!';
          this.showModal = true;
        },
        error => {
          this.modalTitle = 'Error';
          this.modalMessage = 'Failed to update profile. Please try again.';
          this.showModal = true;
        }
      );
    } else {
      this.editForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  onModalClose() {
    this.showModal = false;
    this.router.navigate(['/profiles']);
  }

  goBack(): void {
    this.router.navigate(['/profiles']);
  }
}