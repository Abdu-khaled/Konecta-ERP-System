namespace ReportingService.Models.Dtos;

public class ExpenseDto
{
    public long Id { get; set; }
    public long SubmittedBy { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public long? ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

