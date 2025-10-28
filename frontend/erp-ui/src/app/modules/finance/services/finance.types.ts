export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';

export interface Invoice {
  id?: number; clientName: string; invoiceDate: string; amount: number; status?: InvoiceStatus; createdAt?: string;
}
export interface InvoiceRequest { clientName: string; invoiceDate: string; amount: number; }

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface Expense {
  id?: number; submittedBy?: number; category?: string; amount: number; description?: string; status?: ExpenseStatus; approvedBy?: number; createdAt?: string;
}
export interface ExpenseRequest { submittedBy?: number; category?: string; amount: number; description?: string; }

export interface Payroll {
  id?: number; employeeId?: number; period: string; grossPay?: number; deductions?: number; netPay?: number; createdAt?: string;
}
export interface PayrollRequest { employeeId: number; period: string; grossPay: number; deductions?: number; }
