import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Flowbite } from '../../../../flowbite-decorator';

interface AdminTemplate {
  id: string;
  name: string;
  template_sample_url: string;
}

@Component({
  selector: 'app-admin-templates',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-templates.component.html',
  styleUrls: ['./admin-templates.component.css']
})
@Flowbite()
export class AdminTemplatesComponent implements OnInit {
  templates: AdminTemplate[] = [];
  isLoading = true;
  loadError: string | null = null;

  showEditor = false;
  editorMode: 'create' | 'edit' = 'create';
  editorId = '';
  editorName = '';
  editorSampleUrl = '';
  editorBusy = false;
  editorError: string | null = null;

  showDeleteModal = false;
  templateToDelete: AdminTemplate | null = null;
  isDeleting = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.loadError = null;
    this.http.get<AdminTemplate[]>(`${environment.apiUrl}/Admin/templates`).subscribe({
      next: data => {
        this.templates = (data || []).slice().sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        this.isLoading = false;
      },
      error: err => {
        this.loadError = err?.status === 403 ? 'Forbidden — admin role required.' : 'Failed to load templates.';
        this.templates = [];
        this.isLoading = false;
      }
    });
  }

  openCreate(): void {
    this.editorMode = 'create';
    this.editorId = '';
    this.editorName = '';
    this.editorSampleUrl = '';
    this.editorError = null;
    this.showEditor = true;
  }

  openEdit(t: AdminTemplate): void {
    this.editorMode = 'edit';
    this.editorId = t.id;
    this.editorName = t.name;
    this.editorSampleUrl = t.template_sample_url || '';
    this.editorError = null;
    this.showEditor = true;
  }

  closeEditor(): void {
    if (this.editorBusy) return;
    this.showEditor = false;
  }

  saveEditor(): void {
    const id = this.editorId.trim();
    const name = this.editorName.trim();
    const sampleUrl = this.editorSampleUrl.trim();
    if (!id || !name) {
      this.editorError = 'Id and Name are required.';
      return;
    }

    this.editorBusy = true;
    this.editorError = null;
    const body: AdminTemplate = { id, name, template_sample_url: sampleUrl };

    const req = this.editorMode === 'create'
      ? this.http.post<AdminTemplate>(`${environment.apiUrl}/Admin/templates`, body)
      : this.http.put<AdminTemplate>(`${environment.apiUrl}/Admin/templates/${encodeURIComponent(id)}`, body);

    req.subscribe({
      next: () => {
        this.editorBusy = false;
        this.showEditor = false;
        this.loadTemplates();
      },
      error: err => {
        this.editorBusy = false;
        if (err?.status === 409) {
          this.editorError = `A template with id "${id}" already exists.`;
        } else {
          this.editorError = err?.error?.toString?.() || 'Save failed.';
        }
      }
    });
  }

  askDelete(t: AdminTemplate): void {
    this.templateToDelete = t;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    if (this.isDeleting) return;
    this.showDeleteModal = false;
    this.templateToDelete = null;
  }

  confirmDelete(): void {
    if (!this.templateToDelete || this.isDeleting) return;
    const id = this.templateToDelete.id;
    this.isDeleting = true;
    this.http.delete(`${environment.apiUrl}/Admin/templates/${encodeURIComponent(id)}`).subscribe({
      next: () => {
        this.templates = this.templates.filter(t => t.id !== id);
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.templateToDelete = null;
      },
      error: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.templateToDelete = null;
      }
    });
  }
}
