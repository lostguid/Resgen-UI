import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Flowbite } from '../../../flowbite-decorator';
import { RoleService } from '../../services/role.service';

interface AdminStats {
  totalUsers: number;
  totalTokensUsed: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_email_verified: boolean;
  last_active_in_utc: string;
  tokens_used: number;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
@Flowbite()
export class AdminComponent implements OnInit {
  roles: string[] = [];
  stats: AdminStats | null = null;
  users: AdminUser[] = [];
  isLoadingStats = true;
  isLoadingUsers = true;
  statsError: string | null = null;
  usersError: string | null = null;

  pageSize = 10;
  currentPage = 1;

  sortColumn: 'name' | 'email' | 'is_email_verified' | 'tokens_used' | 'last_active_in_utc' = 'last_active_in_utc';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private roleService: RoleService, private http: HttpClient, private router: Router) {}

  openUser(user: AdminUser): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  ngOnInit(): void {
    this.roleService.roles$.subscribe(roles => (this.roles = roles));
    this.loadStats();
    this.loadUsers();
  }

  loadStats(): void {
    this.isLoadingStats = true;
    this.statsError = null;
    this.http.get<AdminStats>(`${environment.apiUrl}/Admin/stats`).subscribe({
      next: data => {
        this.stats = data;
        this.isLoadingStats = false;
      },
      error: err => {
        this.statsError = err?.status === 403 ? 'Forbidden — admin role required.' : 'Failed to load stats.';
        this.isLoadingStats = false;
      }
    });
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.usersError = null;
    this.http.get<AdminUser[]>(`${environment.apiUrl}/Admin/users`).subscribe({
      next: data => {
        this.users = data || [];
        this.applySort();
        this.currentPage = 1;
        this.isLoadingUsers = false;
      },
      error: err => {
        this.usersError = err?.status === 403 ? 'Forbidden — admin role required.' : 'Failed to load users.';
        this.users = [];
        this.isLoadingUsers = false;
      }
    });
  }

  toggleSort(column: 'name' | 'email' | 'is_email_verified' | 'tokens_used' | 'last_active_in_utc'): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = column === 'last_active_in_utc' || column === 'tokens_used' ? 'desc' : 'asc';
    }
    this.applySort();
    this.currentPage = 1;
  }

  private applySort(): void {
    const col = this.sortColumn;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.users = this.users.slice().sort((a, b) => {
      let av: any = a[col];
      let bv: any = b[col];
      if (col === 'last_active_in_utc') {
        av = new Date(av || 0).getTime();
        bv = new Date(bv || 0).getTime();
      } else if (col === 'is_email_verified') {
        av = av ? 1 : 0;
        bv = bv ? 1 : 0;
      } else if (col === 'tokens_used') {
        av = av ?? 0;
        bv = bv ?? 0;
      } else {
        av = (av ?? '').toString().toLowerCase();
        bv = (bv ?? '').toString().toLowerCase();
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  get verifiedCount(): number {
    return this.users.filter(u => u.is_email_verified).length;
  }

  get unverifiedCount(): number {
    return this.users.filter(u => !u.is_email_verified).length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.users.length / this.pageSize));
  }

  get pagedUsers(): AdminUser[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  get pageStartIndex(): number {
    if (this.users.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.users.length);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  formatLastActive(value: string): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString();
  }
}
