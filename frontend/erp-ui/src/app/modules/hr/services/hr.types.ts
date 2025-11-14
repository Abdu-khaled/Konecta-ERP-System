export interface Department { id?: number; name: string; description?: string }
export interface DepartmentRequest { name: string; description?: string }

export interface Employee {
  id?: number; firstName: string; lastName: string; email?: string; phone?: string;
  position?: string; hireDate?: string; salary?: number; workingHours?: number; departmentId?: number | null; departmentName?: string | null;
  accountMasked?: string | null;
  cardType?: string | null;
}
export interface EmployeeRequest {
  firstName: string; lastName: string; email: string; phone?: string; position?: string; hireDate?: string; salary?: number; workingHours?: number; departmentId?: number | null
}

export interface Job { id?: number; title: string; description?: string; departmentId?: number | null; location?: string; employmentType?: string; status?: string }
export interface JobRequest { title: string; description?: string; departmentId?: number | null; location?: string; employmentType?: string }

export interface Training { id?: number; title: string; description?: string; startDate?: string; endDate?: string; instructor?: string; location?: string }
export interface TrainingRequest { title: string; description?: string; startDate?: string; endDate?: string; instructor?: string; location?: string }
