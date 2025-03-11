import { Component } from '@angular/core';
import { Flowbite } from '../../../flowbite-decorator';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
@Flowbite()
export class ProfileComponent {
form: FormGroup;
/**
 *
 */
constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern('[0-9]{3}-[0-9]{2}-[0-9]{3}')]],
    linkedin: ['', [Validators.required, Validators.pattern('https?://.+')]],
    school: ['', Validators.required],
    loe: ['', Validators.required],
    emails: this.fb.array([
      this.fb.control('', [Validators.required, Validators.email])
    ])
  });
  
}
get emails() {
  return this.form.get('emails') as FormArray;
}

addEmail() {
  this.emails.push(this.fb.control('', [Validators.required, Validators.email]));
}

removeEmail(index: number) {
  this.emails.removeAt(index);
}

onSubmit() {
  if (this.form.valid) {
    console.log(this.form.value);
  } else {
    console.log('Form is invalid');
  }
}
}
