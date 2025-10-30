import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HrApiService } from '../services/hr.api.service';
import { Employee } from '../services/hr.types';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ToastService } from '../../../core/services/toast.service';
import { UserApiService, SystemUser } from '../../../core/services/user-api.service';

type Row = { id: number; firstName: string; lastName: string; present: boolean; hours: number | null; saving?: boolean };

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './attendance.component.html'
})
export class AttendanceComponent implements OnInit {
  private readonly api = inject(HrApiService);
  private readonly toast = inject(ToastService);
  private readonly usersApi = inject(UserApiService);
  employees: Employee[] = [];
  rows: Row[] = [];
  error = '';
  selectedDate = new Date().toISOString().slice(0, 10);

  ngOnInit(): void { this.loadEligibleEmployees(); }

  private loadEligibleEmployees() {
    // Load HR employees + system users, and keep only those whose email belongs to role EMPLOYEE
    this.usersApi.listEmployeeUsers().subscribe({
      next: (users) => {
        const calls = (users || []).map(u => this.api.ensureEmployee({ email: u.email, fullName: u.fullName }));
        if (!calls.length) { this.employees = []; return; }
        forkJoin(calls).subscribe({
          next: (emps) => { this.employees = emps as any; this.loadForDate(); },
          error: () => { this.employees = []; this.error = 'Failed to prepare employees'; }
        });
      },
      error: () => { this.employees = []; this.error = 'Failed to load users'; }
    });
  }

  loadForDate() {
    if (!this.employees?.length) { this.rows = []; return; }
    const date = this.selectedDate;
    const calls = this.employees.map(emp =>
      this.api.listAttendanceByEmployee(emp.id!).pipe(
        map(list => {
          const rec = (list || []).find((a: any) => a.date === date);
          return { id: emp.id!, firstName: emp.firstName, lastName: emp.lastName, present: !!rec?.present, hours: rec?.workingHours ?? null } as Row;
        }),
        catchError(() => of({ id: emp.id!, firstName: emp.firstName, lastName: emp.lastName, present: false, hours: null } as Row))
      )
    );
    forkJoin(calls).subscribe({ next: rows => this.rows = rows, error: () => this.error = 'Failed to load attendance' });
  }

  save(row: Row) {
    row.saving = true;
    const payload = { employeeId: row.id, date: this.selectedDate, present: row.present, workingHours: row.hours ?? undefined };
    this.api.markAttendance(payload).subscribe({
      next: () => { row.saving = false; this.toast.success('Attendance saved'); },
      error: () => { this.error = 'Failed to save'; this.toast.error(this.error); row.saving = false; }
    });
  }
}
