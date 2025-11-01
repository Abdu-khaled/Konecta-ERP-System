using ReportingService.Models;
using ReportingService.Models.Dtos;

namespace ReportingService.Services;

public interface IPdfReportService
{
    Task<byte[]> GeneratePayrollReportAsync(List<PayrollDto> payrolls, string period);
    Task<byte[]> GenerateAttendanceReportAsync(List<AttendanceDto> attendance, DateTime startDate, DateTime endDate);
    Task<byte[]> GenerateFinancialReportAsync(FinancialSummaryDto summary, List<InvoiceDto> invoices, List<ExpenseDto> expenses);
    Task<byte[]> GenerateEmployeeReportAsync(EmployeeDto employee, List<AttendanceDto> attendance, List<PayrollDto> payrolls);
}

