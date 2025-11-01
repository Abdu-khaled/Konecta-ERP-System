namespace ReportingService.Models.Dtos;

public class DashboardAnalyticsDto
{
    public PayrollSummaryDto PayrollSummary { get; set; } = new();
    public AttendanceSummaryDto AttendanceSummary { get; set; } = new();
    public FinancialSummaryDto FinancialSummary { get; set; } = new();
    public List<TrendDataPoint> ExpenseTrends { get; set; } = new();
    public List<ProductivityMetricDto> ProductivityMetrics { get; set; } = new();
}

public class PayrollSummaryDto
{
    public decimal TotalPayroll { get; set; }
    public decimal AverageSalary { get; set; }
    public int EmployeeCount { get; set; }
    public string Period { get; set; } = string.Empty;
}

public class AttendanceSummaryDto
{
    public double AverageAttendanceRate { get; set; }
    public double AverageWorkingHours { get; set; }
    public int TotalPresentDays { get; set; }
    public int TotalAbsentDays { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class FinancialSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetIncome { get; set; }
    public int TotalInvoices { get; set; }
    public int PendingExpenses { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class TrendDataPoint
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class ProductivityMetricDto
{
    public long EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public double AttendanceRate { get; set; }
    public double AverageWorkingHours { get; set; }
    public int TotalWorkingDays { get; set; }
}

