using ReportingService.Models.Dtos;

namespace ReportingService.Services;

public interface IDataAggregationService
{
    Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null, string? period = null, string? authToken = null);
    Task<List<PayrollDto>> AggregatePayrollDataAsync(string period, string? authToken = null);
    Task<List<AttendanceDto>> AggregateAttendanceDataAsync(DateTime startDate, DateTime endDate, long? employeeId = null, string? authToken = null);
    Task<FinancialSummaryDto> AggregateFinancialDataAsync(DateTime startDate, DateTime endDate, string? authToken = null);
}

