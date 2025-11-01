using ReportingService.Models.Dtos;

namespace ReportingService.Services;

public interface IFinanceServiceClient
{
    Task<List<PayrollDto>> GetPayrollByPeriodAsync(string period, string? authToken = null);
    Task<PayrollDto?> GetPayrollByEmployeeAsync(long employeeId, string period, string? authToken = null);
    Task<List<InvoiceDto>> GetInvoicesAsync(string? status = null, string? authToken = null);
    Task<List<ExpenseDto>> GetExpensesAsync(string? status = null, string? authToken = null);
    Task<List<ExpenseDto>> GetExpensesBySubmitterAsync(long employeeId, string? authToken = null);
}

