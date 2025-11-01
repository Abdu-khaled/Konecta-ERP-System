using System.Net.Http.Json;
using System.Text.Json;
using ReportingService.Models.Dtos;

namespace ReportingService.Services;

public class HrServiceClient : IHrServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HrServiceClient> _logger;
    private readonly IConfiguration _configuration;

    public HrServiceClient(HttpClient httpClient, ILogger<HrServiceClient> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;
        
        // Configure base address from configuration or default
        var baseUrl = _configuration["ServiceUrls:HrService"] ?? "http://localhost:8082";
        _httpClient.BaseAddress = new Uri(baseUrl);
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task<List<EmployeeDto>> GetAllEmployeesAsync(string? authToken = null)
    {
        try
        {
            AddAuthHeader(authToken);
            var response = await _httpClient.GetAsync("/api/hr/employees");
            response.EnsureSuccessStatusCode();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var employees = await response.Content.ReadFromJsonAsync<List<EmployeeDto>>(options);
            return employees ?? new List<EmployeeDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employees from HR service");
            return new List<EmployeeDto>();
        }
    }

    public async Task<EmployeeDto?> GetEmployeeByIdAsync(long id, string? authToken = null)
    {
        try
        {
            AddAuthHeader(authToken);
            var response = await _httpClient.GetAsync($"/api/hr/employees/{id}");
            
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;
                
            response.EnsureSuccessStatusCode();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return await response.Content.ReadFromJsonAsync<EmployeeDto>(options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee {EmployeeId} from HR service", id);
            return null;
        }
    }

    public async Task<List<AttendanceDto>> GetAttendanceByEmployeeAsync(long employeeId, string? authToken = null)
    {
        try
        {
            AddAuthHeader(authToken);
            var response = await _httpClient.GetAsync($"/api/hr/attendance/{employeeId}");
            response.EnsureSuccessStatusCode();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var attendances = await response.Content.ReadFromJsonAsync<List<AttendanceDto>>(options);
            return attendances ?? new List<AttendanceDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching attendance for employee {EmployeeId} from HR service", employeeId);
            return new List<AttendanceDto>();
        }
    }

    public async Task<List<AttendanceDto>> GetAttendanceByDateRangeAsync(DateTime startDate, DateTime endDate, string? authToken = null)
    {
        try
        {
            // Get all employees first
            var employees = await GetAllEmployeesAsync(authToken);
            var allAttendance = new List<AttendanceDto>();

            // Fetch attendance for each employee and filter by date range
            foreach (var employee in employees)
            {
                var attendance = await GetAttendanceByEmployeeAsync(employee.Id, authToken);
                var filtered = attendance.Where(a => a.Date >= startDate && a.Date <= endDate).ToList();
                allAttendance.AddRange(filtered);
            }

            return allAttendance;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching attendance by date range from HR service");
            return new List<AttendanceDto>();
        }
    }

    private void AddAuthHeader(string? authToken)
    {
        if (!string.IsNullOrEmpty(authToken))
        {
            _httpClient.DefaultRequestHeaders.Remove("Authorization");
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {authToken}");
        }
    }
}

