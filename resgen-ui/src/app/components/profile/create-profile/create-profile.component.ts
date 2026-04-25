import { Component, AfterViewInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Flowbite } from '../../../../flowbite-decorator';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Datepicker } from 'flowbite-datepicker';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-create-profile',
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
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

  // ---- Import from resume (self-contained, does not touch the existing form/onSubmit logic) ----
  importFile: File | null = null;
  importBusy = false;
  importError: string | null = null;
  importCompleted = false;
  importOpen = false;

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
      experiences: this.fb.array([this.createExperienceFormGroup()]),
      certifications: this.fb.array([]),
      leadership: this.fb.array([])
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
        const control = this.form.get(`experiences.${match[2]}.${match[1]}`);
        if (control) {
          control.setValue(input.value);
          control.markAsDirty();
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
    });
  }

  createExperienceFormGroup(): FormGroup {
    return this.fb.group({
      companyName: ['', Validators.required],
      title: ['', Validators.required],
      startDate: ['', [Validators.required, this.validDate]],
      endDate: ['', [Validators.required, this.validDate]],
      skillsUsed: ['', Validators.required]
    },{ validator: this.dateLessThan('startDate', 'endDate') });
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

  dropExperience(event: CdkDragDrop<AbstractControl[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const control = this.experiences.at(event.previousIndex);
    this.experiences.removeAt(event.previousIndex);
    this.experiences.insert(event.currentIndex, control);
    this.experiences.markAsDirty();
    this.experiences.updateValueAndValidity();
  }

  createCertificationFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      issuingOrg: [''],
      dateAcquired: ['']
    });
  }

  get certifications() {
    return this.form.get('certifications') as FormArray;
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

  createLeadershipFormGroup(): FormGroup {
    return this.fb.group({
      role: [''],
      organization: [''],
      dateRange: ['']
    });
  }

  get leadership() {
    return this.form.get('leadership') as FormArray;
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
    if (control?.hasError('invalidDate')) {
      return 'Enter a valid date (MM/DD/YYYY)';
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

  // ---- Import from resume (self-contained) -----------------------------------

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importError = null;
    this.importCompleted = false;
    if (!input.files || input.files.length === 0) {
      this.importFile = null;
      return;
    }
    const file = input.files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.importFile = null;
      this.importError = 'Only PDF files are supported.';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.importFile = null;
      this.importError = 'File is too large (max 10 MB).';
      return;
    }
    this.importFile = file;
  }

  importFromFile(): void {
    if (!this.importFile || this.importBusy) return;

    const userId = localStorage.getItem('user.id') || '';
    if (!userId) {
      this.importError = 'Could not resolve user id — please sign in again.';
      return;
    }

    this.importBusy = true;
    this.importError = null;
    this.importCompleted = false;

    const formData = new FormData();
    formData.append('file', this.importFile);
    const url = `${environment.apiUrl}/profile/import?userId=${encodeURIComponent(userId)}`;

    this.http.post<any>(url, formData).subscribe({
      next: parsed => {
        try {
          this.applyImportedProfile(parsed || {});
          this.importCompleted = true;
        } catch (e) {
          this.importError = 'Import succeeded but populating the form failed. Please fill the fields manually.';
        }
        this.importBusy = false;
      },
      error: err => {
        this.importBusy = false;
        const msg = typeof err?.error === 'string' && err.error
          ? err.error
          : 'Import failed. Please try again or fill the fields manually.';
        this.importError = msg;
      }
    });
  }

  clearImport(fileInput?: HTMLInputElement): void {
    if (this.importBusy) return;
    this.importFile = null;
    this.importError = null;
    this.importCompleted = false;
    if (fileInput) fileInput.value = '';
  }

  private applyImportedProfile(p: any): void {
    // Top-level fields — only patch values that the server returned non-empty,
    // so we don't clobber user-entered values unnecessarily.
    const patch: any = {};
    if (p.first_name) patch.firstName = p.first_name;
    if (p.last_name) patch.lastName = p.last_name;
    if (p.email) patch.email = p.email;
    if (p.phone) patch.phone = this.normalizePhone(p.phone);
    if (p.linkedin_url) patch.linkedin = p.linkedin_url;
    if (p.school_name) patch.school = p.school_name;
    if (p.level_of_education) patch.loe = p.level_of_education;
    this.form.patchValue(patch);

    // Experiences — rebuild the FormArray so existing placeholder rows are replaced.
    const experiences = Array.isArray(p.experiences) ? p.experiences : [];
    this.experiences.clear();
    if (experiences.length === 0) {
      this.experiences.push(this.createExperienceFormGroup());
    } else {
      for (const exp of experiences) {
        const group = this.createExperienceFormGroup();
        const skillsArray = Array.isArray(exp?.skills_used) ? exp.skills_used : [];
        group.patchValue({
          companyName: exp?.company_name || '',
          title: exp?.title || '',
          startDate: exp?.start_date_in_utc || '',
          endDate: exp?.end_date_in_utc || '',
          skillsUsed: skillsArray.join(', ')
        });
        this.experiences.push(group);
      }
    }

    // Certifications
    const certs = Array.isArray(p.certifications) ? p.certifications : [];
    this.certifications.clear();
    for (const c of certs) {
      if (!c?.name) continue;
      const group = this.createCertificationFormGroup();
      group.patchValue({
        name: c.name || '',
        issuingOrg: c.issuing_org || '',
        dateAcquired: c.date_acquired || ''
      });
      this.certifications.push(group);
    }

    // Leadership
    const leadership = Array.isArray(p.leadership) ? p.leadership : [];
    this.leadership.clear();
    for (const l of leadership) {
      if (!l?.role) continue;
      const group = this.createLeadershipFormGroup();
      group.patchValue({
        role: l.role || '',
        organization: l.organization || '',
        dateRange: l.date_range || ''
      });
      this.leadership.push(group);
    }

    // Re-initialize the datepickers so the newly-added experience rows pick them up.
    setTimeout(() => this.initializeDatepickers(), 0);
  }

  private normalizePhone(raw: string): string {
    const digits = (raw || '').replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) return digits.substring(1);
    return digits;
  }
}