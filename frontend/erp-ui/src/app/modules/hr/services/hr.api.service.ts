import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Department, DepartmentRequest, Employee, EmployeeRequest, Job, JobRequest } from './hr.types';

export const HR_API_BASE_URL = new InjectionToken<string>('HR_API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api/hr'
});

@Injectable({ providedIn: 'root' })
export class HrApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(HR_API_BASE_URL);

  listDepartments() { return this.http.get<Department[]>(`${this.base}/departments`); }
  createDepartment(payload: DepartmentRequest) { return this.http.post<Department>(`${this.base}/departments`, payload); }
  updateDepartment(id: number, payload: DepartmentRequest) { return this.http.put<Department>(`${this.base}/departments/${id}`, payload); }
  deleteDepartment(id: number) { return this.http.delete<void>(`${this.base}/departments/${id}`); }
  listEmployees() { return this.http.get<Employee[]>(`${this.base}/employees`); }
  ensureEmployee(payload: { email: string; fullName?: string; phone?: string; position?: string; departmentId?: number | null; salary?: number | null; workingHours?: number | null }) {
    return this.http.post<Employee>(`${this.base}/employees/ensure`, payload);
  }
  createEmployee(payload: EmployeeRequest) { return this.http.post<Employee>(`${this.base}/employees`, payload); }
  updateEmployee(id: number, payload: EmployeeRequest) { return this.http.put<Employee>(`${this.base}/employees/${id}`, payload); }
  deleteEmployee(id: number) { return this.http.delete<void>(`${this.base}/employees/${id}`); }
  getEmployeeByEmail(email: string) { return this.listEmployees().pipe(map(list => list.find(e => (e.email || '').toLowerCase() === email.toLowerCase()) || null)); }
  listAttendanceByEmployee(employeeId: number) { return this.http.get<any[]>(`${this.base}/attendance/${employeeId}`); }
  markAttendance(payload: { employeeId: number; date: string; present: boolean; workingHours?: number }) { return this.http.post<any>(`${this.base}/attendance`, payload); }
  listLeavesByEmployee(employeeId: number) { return this.http.get<any[]>(`${this.base}/leaves/${employeeId}`); }
  createLeave(payload: { employeeId: number; startDate: string; endDate: string; reason?: string }) { return this.http.post<any>(`${this.base}/leaves`, payload); }
  approveLeave(id: number) { return this.http.put<any>(`${this.base}/leaves/${id}/approve`, {}); }
  rejectLeave(id: number) { return this.http.put<any>(`${this.base}/leaves/${id}/reject`, {}); }
  listPerformanceByEmployee(employeeId: number) { return this.http.get<any[]>(`${this.base}/performance/${employeeId}`); }
  createPerformance(payload: { employeeId: number; rating: number; feedback?: string; reviewDate: string }) { return this.http.post<any>(`${this.base}/performance`, payload); }
}
