namespace ReportingService.Models;

public class ReportRequest
{
    public ReportType Type { get; set; }
    public ExportFormat Format { get; set; }
    public string? Period { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public long? EmployeeId { get; set; }
    public string? Department { get; set; }
}

public enum ReportType
{
    PayrollSummary,
    AttendanceReport,
    FinancialSummary,
    EmployeeReport,
    ExpenseReport,
    InvoiceReport
}

public enum ExportFormat
{
    Pdf,
    Excel
}

