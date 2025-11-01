export interface Department { id?: number; name: string; description?: string }
export interface DepartmentRequest { name: string; description?: string }

export interface Employee {
  id?: number; firstName: string; lastName: string; email?: string; phone?: string;
  position?: string; hireDate?: string; salary?: number; departmentId?: number | null; departmentName?: string | null
}
export interface EmployeeRequest {
  firstName: string; lastName: string; email: string; phone?: string; position?: string; hireDate?: string; salary?: number; departmentId?: number | null
}

