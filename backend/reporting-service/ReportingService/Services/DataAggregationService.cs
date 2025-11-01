using ReportingService.Models.Dtos;

namespace ReportingService.Services;

public class DataAggregationService : IDataAggregationService
{
    private readonly IHrServiceClient _hrClient;
    private readonly IFinanceServiceClient _financeClient;
    private readonly ILogger<DataAggregationService> _logger;

    public DataAggregationService(
        IHrServiceClient hrClient,
        IFinanceServiceClient financeClient,
        ILogger<DataAggregationService> logger)
    {
        _hrClient = hrClient;
        _financeClient = financeClient;
        _logger = logger;
    }

    public async Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null, string? period = null, string? authToken = null)
    {
        var analytics = new DashboardAnalyticsDto();

        // Set default date range if not provided
        if (!startDate.HasValue)
            startDate = DateTime.Now.AddMonths(-1);
        if (!endDate.HasValue)
            endDate = DateTime.Now;

        try
        {
            // Aggregate payroll data
            if (!string.IsNullOrEmpty(period))
            {
                var payrolls = await _financeClient.GetPayrollByPeriodAsync(period, authToken);
                analytics.PayrollSummary = CalculatePayrollSummary(payrolls, period);
            }

            // Aggregate attendance data
            var attendance = await _hrClient.GetAttendanceByDateRangeAsync(startDate.Value, endDate.Value, authToken);
            analytics.AttendanceSummary = CalculateAttendanceSummary(attendance, startDate.Value, endDate.Value);

            // Aggregate financial data
            analytics.FinancialSummary = await AggregateFinancialDataAsync(startDate.Value, endDate.Value, authToken);

            // Calculate expense trends
            var expenses = await _financeClient.GetExpensesAsync(null, authToken);
            analytics.ExpenseTrends = CalculateExpenseTrends(expenses, startDate.Value, endDate.Value);

            // Calculate productivity metrics
            var employees = await _hrClient.GetAllEmployeesAsync(authToken);
            analytics.ProductivityMetrics = await CalculateProductivityMetrics(employees, attendance, authToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error aggregating dashboard analytics");
        }

        return analytics;
    }

    public async Task<List<PayrollDto>> AggregatePayrollDataAsync(string period, string? authToken = null)
    {
        return await _financeClient.GetPayrollByPeriodAsync(period, authToken);
    }

    public async Task<List<AttendanceDto>> AggregateAttendanceDataAsync(DateTime startDate, DateTime endDate, long? employeeId = null, string? authToken = null)
    {
        if (employeeId.HasValue)
        {
            var attendance = await _hrClient.GetAttendanceByEmployeeAsync(employeeId.Value, authToken);
            return attendance.Where(a => a.Date >= startDate && a.Date <= endDate).ToList();
        }

        return await _hrClient.GetAttendanceByDateRangeAsync(startDate, endDate, authToken);
    }

    public async Task<FinancialSummaryDto> AggregateFinancialDataAsync(DateTime startDate, DateTime endDate, string? authToken = null)
    {
        var invoices = await _financeClient.GetInvoicesAsync(null, authToken);
        var expenses = await _financeClient.GetExpensesAsync(null, authToken);

        var filteredInvoices = invoices.Where(i => i.InvoiceDate >= startDate && i.InvoiceDate <= endDate).ToList();
        var filteredExpenses = expenses.Where(e => e.CreatedAt >= startDate && e.CreatedAt <= endDate).ToList();

        return new FinancialSummaryDto
        {
            TotalRevenue = filteredInvoices.Where(i => i.Status.ToUpper() == "PAID").Sum(i => i.Amount),
            TotalExpenses = filteredExpenses.Where(e => e.Status.ToUpper() == "APPROVED").Sum(e => e.Amount),
            TotalInvoices = filteredInvoices.Count,
            PendingExpenses = filteredExpenses.Count(e => e.Status.ToUpper() == "PENDING"),
            StartDate = startDate,
            EndDate = endDate,
            NetIncome = filteredInvoices.Where(i => i.Status.ToUpper() == "PAID").Sum(i => i.Amount) - 
                       filteredExpenses.Where(e => e.Status.ToUpper() == "APPROVED").Sum(e => e.Amount)
        };
    }

    private PayrollSummaryDto CalculatePayrollSummary(List<PayrollDto> payrolls, string period)
    {
        if (payrolls == null || !payrolls.Any())
            return new PayrollSummaryDto { Period = period };

        return new PayrollSummaryDto
        {
            TotalPayroll = payrolls.Sum(p => p.NetSalary),
            AverageSalary = payrolls.Average(p => p.NetSalary),
            EmployeeCount = payrolls.Count,
            Period = period
        };
    }

    private AttendanceSummaryDto CalculateAttendanceSummary(List<AttendanceDto> attendance, DateTime startDate, DateTime endDate)
    {
        if (attendance == null || !attendance.Any())
            return new AttendanceSummaryDto { StartDate = startDate, EndDate = endDate };

        var totalDays = (endDate - startDate).Days + 1;
        var presentDays = attendance.Count(a => a.Present);
        var absentDays = totalDays - presentDays;

        return new AttendanceSummaryDto
        {
            AverageAttendanceRate = totalDays > 0 ? (double)presentDays / totalDays * 100 : 0,
            AverageWorkingHours = attendance.Any() ? attendance.Where(a => a.WorkingHours.HasValue).Select(a => (double)a.WorkingHours!.Value).DefaultIfEmpty(0).Average() : 0,
            TotalPresentDays = presentDays,
            TotalAbsentDays = absentDays,
            StartDate = startDate,
            EndDate = endDate
        };
    }

    private List<TrendDataPoint> CalculateExpenseTrends(List<ExpenseDto> expenses, DateTime startDate, DateTime endDate)
    {
        var filteredExpenses = expenses.Where(e => e.CreatedAt >= startDate && e.CreatedAt <= endDate).ToList();
        
        return filteredExpenses
            .GroupBy(e => new { e.CreatedAt.Date, e.Category })
            .Select(g => new TrendDataPoint
            {
                Date = g.Key.Date,
                Value = g.Sum(e => e.Amount),
                Category = g.Key.Category
            })
            .OrderBy(t => t.Date)
            .ToList();
    }

    private async Task<List<ProductivityMetricDto>> CalculateProductivityMetrics(
        List<EmployeeDto> employees, 
        List<AttendanceDto> attendance, 
        string? authToken = null)
    {
        var metrics = new List<ProductivityMetricDto>();

        foreach (var employee in employees)
        {
            var employeeAttendance = attendance.Where(a => a.EmployeeId == employee.Id).ToList();
            var totalDays = employeeAttendance.Count;
            var presentDays = employeeAttendance.Count(a => a.Present);

            metrics.Add(new ProductivityMetricDto
            {
                EmployeeId = employee.Id,
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                AttendanceRate = totalDays > 0 ? (double)presentDays / totalDays * 100 : 0,
                AverageWorkingHours = employeeAttendance.Any() ? employeeAttendance.Where(a => a.WorkingHours.HasValue).Select(a => (double)a.WorkingHours!.Value).DefaultIfEmpty(0).Average() : 0,
                TotalWorkingDays = presentDays
            });
        }

        return metrics.OrderByDescending(m => m.AttendanceRate).ToList();
    }
}

