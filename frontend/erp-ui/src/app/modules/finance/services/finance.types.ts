export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';

export interface InvoiceItem {
  id?: number;
  product?: string;
  account?: string;
  dueDate?: string; // YYYY-MM-DD
  quantity?: number;
  price?: number;
  discountPercent?: number;
  taxPercent?: number;
  whPercent?: number; // 0 | 1 | 3 | 5
  baseAmount?: number;
  taxAmount?: number;
  withholding?: number;
  lineTotal?: number;
}

export interface Invoice {
  id?: number;
  clientName: string;
  invoiceDate: string;
  amount: number;
  status?: InvoiceStatus;
  createdAt?: string;
  items?: InvoiceItem[];
  untaxedTotal?: number;
  taxTotal?: number;
  withholdingTotal?: number;
  grandTotal?: number;
  pdfAttached?: boolean;
}
export interface InvoiceRequest {
  clientName: string;
  invoiceDate: string;
  amount?: number;
  items?: InvoiceItem[];
}

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface Expense {
  id?: number; submittedBy?: number; category?: string; amount: number; description?: string; status?: ExpenseStatus; approvedBy?: number; createdAt?: string; department?: string; expenseDate?: string;
}
export interface ExpenseRequest { submittedBy?: number; category?: string; amount: number; description?: string; }

export interface Payroll {
  id?: number;
  employeeId?: number;
  period: string; // YYYY-MM
  baseSalary?: number;
  bonuses?: number;
  deductions?: number;
  netSalary?: number;
  processedDate?: string;
}
export interface PayrollRequest {
  employeeId: number;
  period: string; // YYYY-MM
  baseSalary?: number; // optional; backend can fetch from HR if omitted
  bonuses?: number;
  deductions?: number;
}
