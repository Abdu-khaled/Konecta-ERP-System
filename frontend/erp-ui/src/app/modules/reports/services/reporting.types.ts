// Types mirrored from backend DTOs for the Reporting Service

export interface PayrollSummaryDto {
  totalPayroll: number;
  averageSalary: number;
  employeeCount: number;
  period: string;
}

export interface AttendanceSummaryDto {
  averageAttendanceRate: number; // percentage 0-100
  averageWorkingHours: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  startDate: string; // ISO date
  endDate: string;   // ISO date
}

export interface FinancialSummaryDto {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalInvoices: number;
  pendingExpenses: number;
  startDate: string; // ISO date
  endDate: string;   // ISO date
}

export interface TrendDataPoint {
  date: string; // ISO date
  value: number;
  category: string;
}

export interface ProductivityMetricDto {
  employeeId: number;
  employeeName: string;
  attendanceRate: number; // percentage
  averageWorkingHours: number;
  totalWorkingDays: number;
}

export interface DashboardAnalyticsDto {
  payrollSummary: PayrollSummaryDto;
  attendanceSummary: AttendanceSummaryDto;
  financialSummary: FinancialSummaryDto;
  expenseTrends: TrendDataPoint[];
  productivityMetrics: ProductivityMetricDto[];
}

export type ExportFormat = 'Pdf' | 'Excel';

export type ReportType =
  | 'PayrollSummary'
  | 'AttendanceReport'
  | 'FinancialSummary'
  | 'EmployeeReport'
  | 'ExpenseReport'
  | 'InvoiceReport';

export interface ReportRequest {
  type: ReportType;
  format: ExportFormat;
  period?: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  employeeId?: number;
  department?: string;
}

