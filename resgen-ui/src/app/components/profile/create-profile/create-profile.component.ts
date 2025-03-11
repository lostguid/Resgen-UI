import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Flowbite } from '../../../../flowbite-decorator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-profile.component.html',
  styleUrl: './create-profile.component.css'
})

@Flowbite()
export class CreateProfileComponent {
form: FormGroup;
/**
 *
 */
constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    profileName: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern('[0-9]{3}-[0-9]{3}-[0-9]{4}')]],
    linkedin: ['', [Validators.required, Validators.pattern('https?://.+')]],
    school: ['', Validators.required],
    loe: ['', Validators.required],
    experiences: this.fb.array([
      this.createExperienceFormGroup()
    ])
  });
  
}
createExperienceFormGroup(): FormGroup {
  return this.fb.group({
    companyName: ['', Validators.required],
    title: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    skillsUsed: ['', Validators.required]
  });
}

get experiences() {
  return this.form.get('experiences') as FormArray;
}

addExperience() {
  this.experiences.push(this.createExperienceFormGroup());
}

removeExperience(index: number) {
  this.experiences.removeAt(index);
}

getErrorMessage(controlName: string): string {
  const control = this.form.get(controlName);
  if (control?.hasError('required')) {
    return 'Field cannot be empty';
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
    console.log(this.form.value);
  } else {
    this.form.markAllAsTouched();
    console.log('Form is invalid');
  }
}
}
