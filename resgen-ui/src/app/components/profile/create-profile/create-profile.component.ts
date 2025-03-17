import { Component, AfterViewInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Flowbite } from '../../../../flowbite-decorator';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Datepicker } from 'flowbite-datepicker';

@Component({
  selector: 'app-create-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.css']
})
@Flowbite()
export class CreateProfileComponent implements AfterViewInit {
  form: FormGroup;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalClass = '';
  modalIcon = '';

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.form = this.fb.group({
      profileName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]],
      linkedin: ['https://www.linkedin.com/in/', [Validators.required, Validators.pattern('^(https?:\/\/)?(www\.)?linkedin\.com\/.*$')]],
      school: ['', Validators.required],
      loe: ['', Validators.required],
      experiences: this.fb.array([this.createExperienceFormGroup()])
    });
    //this.initializeDatepickers()
  }

  ngOnInit() {
    setTimeout(() => this.initializeDatepickers(), 1000); // Reinitialize datepickers for new elements
    
  }


  ngAfterViewInit() {
    //this.initializeDatepickers();
  }

  initializeDatepickers() {
    const datepickerElements = document.querySelectorAll('[datepickerr]');
    datepickerElements.forEach((el) => {      
      const datepicker = new Datepicker(el as HTMLElement, {
        // Optional: Add any datepicker options here
      });
      el.addEventListener('changeDate', (event: any) => {
        const input = event.target as HTMLInputElement;
        const formControlName = input.getAttribute('id');        
        if (formControlName) {
          const splitString = formControlName.replace(/(\d+)$/, '.$1').replace(/(.*)\.(\d+)/, '$2.$1');
          const control = this.form.get('experiences.'+splitString);
          if (control) {
            control.setValue(input.value);
            control.markAsDirty();
            control.updateValueAndValidity();
          }
        }
      });
    });
  }

  createExperienceFormGroup(): FormGroup {
    return this.fb.group({
      companyName: ['', Validators.required],
      title: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      skillsUsed: ['', Validators.required]
    },{ validator: this.dateLessThan('startDate', 'endDate') });
  }

  dateLessThan(start: string, end: string) {    
    return (group: AbstractControl): { [key: string]: any } | null => {
      const startDate = this.convertToDate(group.get(start)?.value);
      const endDate = this.convertToDate(group.get(end)?.value);      
      return startDate && endDate && startDate > endDate ? { 'dateInvalid': true } : null;
    };
  }

  convertToDate(dateString: string): Date {
    const [month, day, year] = dateString.split('/').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }


  get experiences() {
    return this.form.get('experiences') as FormArray;
  }

  addExperience() {
    this.experiences.push(this.createExperienceFormGroup());
    setTimeout(() => this.initializeDatepickers(), 0); // Reinitialize datepickers for new elements
  }

  removeExperience(index: number) {
    this.experiences.removeAt(index);
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
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
    if (this.form.valid) {
      const formValue = this.form.value;
      const formattedData = {
        id: '3', // You can generate or assign an ID as needed
        name: `${formValue.firstName} ${formValue.lastName}`,
        profile_name: formValue.profileName,
        user_id: localStorage.getItem('user.id'), // You can generate or assign a user ID as needed
        created_at_in_utc: new Date().toISOString(), // Current timestamp
        first_name: formValue.firstName,
        last_name: formValue.lastName,
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

      this.http.post(`${environment.apiUrl}/profile`, formattedData).subscribe(
        response => {
          this.showModal = true;
          this.modalTitle = 'Success';
          this.modalMessage = 'Profile created successfully';
          this.modalClass = 'bg-green-500';
          this.modalIcon = 'M5 13l4 4L19 7';
        },
        error => {
          this.showModal = true;
          this.modalTitle = 'Error';
          this.modalMessage = 'Error creating profile';
          this.modalClass = 'bg-red-500';
          this.modalIcon = 'M6 18L18 6M6 6l12 12';
        }
      );
    } else {
      this.form.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  closeModal() {
    this.showModal = false;
    this.router.navigate(['/profiles']);
  }

  goBack(): void {
    this.router.navigate(['/profiles']);
  }
}