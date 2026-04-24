import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Datepicker } from 'flowbite-datepicker';
import { CommonModule } from '@angular/common';
import { Flowbite } from '../../../../flowbite-decorator';
import { first } from 'rxjs';
import { ModalComponent } from '../../modal/modal.component';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, DragDropModule]
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
      experiences: this.fb.array([]),
      certifications: this.fb.array([]),
      leadership: this.fb.array([])
    });
    this.profileId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    this.loadProfile();
    setTimeout(() => this.initializeDatepickers(), 1000); // Reinitialize datepickers for new elements
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
      this.setCertifications(data.certifications ?? []);
      this.setLeadership(data.leadership ?? []);
    });
  }

  setExperiences(experiences: any[]) {
    const experienceFormGroups = experiences.map(exp => this.createExperienceFormGroup(exp));
    const experienceFormArray = this.fb.array(experienceFormGroups);
    this.editForm.setControl('experiences', experienceFormArray);
    this.initializeDatepickers();
  }

  setCertifications(certifications: any[]) {
    const certFormGroups = certifications.map(c => this.createCertificationFormGroup(c));
    this.editForm.setControl('certifications', this.fb.array(certFormGroups));
  }

  setLeadership(leadership: any[]) {
    const leadershipFormGroups = leadership.map(l => this.createLeadershipFormGroup(l));
    this.editForm.setControl('leadership', this.fb.array(leadershipFormGroups));
  }

  createExperienceFormGroup(exp?: any): FormGroup {
    return this.fb.group({
      companyName: [exp?.company_name ?? '', Validators.required],
      title: [exp?.title ?? '', Validators.required],
      startDate: [exp?.start_date_in_utc ?? '', [Validators.required, this.validDate]],
      endDate: [exp?.end_date_in_utc ?? '', [Validators.required, this.validDate]],
      skillsUsed: [exp?.skills_used ? exp.skills_used.join(', ') : '', Validators.required]
    }, { validator: this.dateLessThan('startDate', 'endDate') });
  }

  validDate(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return { invalidDate: true };
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
      return { invalidDate: true };
    }
    return null;
  }

  dateLessThan(start: string, end: string) {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const startDate = this.convertToDate(group.get(start)?.value);
      const endDate = this.convertToDate(group.get(end)?.value);
      return startDate && endDate && startDate > endDate ? { 'dateInvalid': true } : null;
    };
  }

  convertToDate(dateString: string): Date {
    const [month, day, year] = (dateString || '').split('/').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

  initializeDatepickers() {
    const datepickerElements = document.querySelectorAll<HTMLInputElement>('[datepickerr]');
    datepickerElements.forEach((el) => {
      if (el.dataset['dpInit'] === '1') return;
      el.dataset['dpInit'] = '1';

      new Datepicker(el, {
        autohide: true,
        format: 'mm/dd/yyyy'
      });

      el.addEventListener('changeDate', (event: any) => {
        const input = event.target as HTMLInputElement;
        const id = input.getAttribute('id');
        if (!id) return;
        const match = /^(startDate|endDate)(\d+)$/.exec(id);
        if (!match) return;
        const control = this.editForm.get(`experiences.${match[2]}.${match[1]}`);
        if (control) {
          control.setValue(input.value);
          control.markAsDirty();
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
    });
  }

  get experiences() {
    return this.editForm.get('experiences') as FormArray;
  }

  addExperience() {
    this.experiences.push(this.createExperienceFormGroup());
    setTimeout(() => this.initializeDatepickers(), 0); // Reinitialize datepickers for new elements
  }

  removeExperience(index: number) {
    this.experiences.removeAt(index);
  }

  dropExperience(event: CdkDragDrop<AbstractControl[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const control = this.experiences.at(event.previousIndex);
    this.experiences.removeAt(event.previousIndex);
    this.experiences.insert(event.currentIndex, control);
    this.experiences.markAsDirty();
    this.experiences.updateValueAndValidity();
  }

  createCertificationFormGroup(cert?: any): FormGroup {
    return this.fb.group({
      name: [cert?.name ?? '', Validators.required],
      issuingOrg: [cert?.issuing_org ?? ''],
      dateAcquired: [cert?.date_acquired ?? '']
    });
  }

  get certifications() {
    return this.editForm.get('certifications') as FormArray;
  }

  addCertification() {
    this.certifications.push(this.createCertificationFormGroup());
  }

  removeCertification(index: number) {
    this.certifications.removeAt(index);
  }

  getCertificationErrorMessage(index: number, controlName: string): string {
    const control = this.certifications.at(index)?.get(controlName);
    if (control?.hasError('required')) {
      return 'Field cannot be empty';
    }
    return 'Invalid Input';
  }

  createLeadershipFormGroup(item?: any): FormGroup {
    return this.fb.group({
      role: [item?.role ?? ''],
      organization: [item?.organization ?? ''],
      dateRange: [item?.date_range ?? '']
    });
  }

  get leadership() {
    return this.editForm.get('leadership') as FormArray;
  }

  addLeadership() {
    this.leadership.push(this.createLeadershipFormGroup());
  }

  removeLeadership(index: number) {
    this.leadership.removeAt(index);
  }

  getLeadershipErrorMessage(index: number, controlName: string): string {
    const control = this.leadership.at(index)?.get(controlName);
    if (control?.hasError('required')) {
      return 'Field cannot be empty';
    }
    return 'Invalid Input';
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
    if (control?.hasError('invalidDate')) {
      return 'Enter a valid date (MM/DD/YYYY)';
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
        })),
        certifications: (formValue.certifications ?? [])
          .filter((c: any) => c?.name?.trim())
          .map((c: any) => ({
            name: c.name.trim(),
            issuing_org: (c.issuingOrg ?? '').trim(),
            date_acquired: (c.dateAcquired ?? '').trim()
          })),
        leadership: (formValue.leadership ?? [])
          .filter((l: any) => l?.role?.trim())
          .map((l: any) => ({
            role: l.role.trim(),
            organization: (l.organization ?? '').trim(),
            date_range: (l.dateRange ?? '').trim()
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