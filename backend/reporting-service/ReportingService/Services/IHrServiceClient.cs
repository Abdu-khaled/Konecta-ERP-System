using ReportingService.Models.Dtos;

namespace ReportingService.Services;

public interface IHrServiceClient
{
    Task<List<EmployeeDto>> GetAllEmployeesAsync(string? authToken = null);
    Task<EmployeeDto?> GetEmployeeByIdAsync(long id, string? authToken = null);
    Task<List<AttendanceDto>> GetAttendanceByEmployeeAsync(long employeeId, string? authToken = null);
    Task<List<AttendanceDto>> GetAttendanceByDateRangeAsync(DateTime startDate, DateTime endDate, string? authToken = null);
}

