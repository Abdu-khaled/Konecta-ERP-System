namespace ReportingService.Models.Dtos;

public class AttendanceDto
{
    public long Id { get; set; }
    public long EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public bool Present { get; set; }
    public decimal? WorkingHours { get; set; }
}

