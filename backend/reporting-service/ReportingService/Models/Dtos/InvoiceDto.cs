namespace ReportingService.Models.Dtos;

public class InvoiceDto
{
    public long Id { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

