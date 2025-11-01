using System.Net.Http.Json;
using System.Text.Json;
using ReportingService.Models.Dtos;

namespace ReportingService.Services;

public class FinanceServiceClient : IFinanceServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FinanceServiceClient> _logger;
    private readonly IConfiguration _configuration;

    public FinanceServiceClient(HttpClient httpClient, ILogger<FinanceServiceClient> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;
        
        var baseUrl = _configuration["ServiceUrls:FinanceService"] ?? "http://localhost:8083";
        _httpClient.BaseAddress = new Uri(baseUrl);
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task<List<PayrollDto>> GetPayrollByPeriodAsync(string period, string? authToken = null)
    {
        try
        {
            AddAuthHeader(authToken);
            var response = await _httpClient.GetAsync($"/api/finance/payroll?period={Uri.EscapeDataString(period)}");
            response.EnsureSuccessStatusCode();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var payrolls = await response.Content.ReadFromJsonAsync<List<PayrollDto>>(options);
            return payrolls ?? new List<PayrollDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching payroll for period {Period} from Finance service", period);
            return new List<PayrollDto>();
        }
    }

    public async Task<PayrollDto?> GetPayrollByEmployeeAsync(long employeeId, string period, string? authToken = null)
    {
        try
        {
            AddAuthHeader(authToken);
            var response = await _httpClient.GetAsync($"/api/finance/payroll/employee/{employeeId}?period={Uri.EscapeDataString(period)}");
            
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;
                
            response.EnsureSuccessStatusCode();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return await response.Content.ReadFromJsonAsync<PayrollDto>(options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching payroll for employee {EmployeeId} and period {Period}", employeeId, period);
            return null;
        }
    }

    public async Task<List<InvoiceDto>> GetInvoicesAsync(string? status = null, string? authToken = null)
    {
        try
        {
            AddAuthHeader(authToken);
            var url = "/api/finance/invoices";
            if (!string.IsNullOrEmpty(status))
            {
                url += $"?status={Uri.EscapeDataString(status)}";
            }
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var invoices = await response.Content.ReadFromJsonAsync<List<InvoiceDto>>(options);
            return invoices ?? new List<InvoiceDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching invoices from Finance service");
            return new List<InvoiceDto>();
        }
    }

    public async Task<List<ExpenseDto>> GetExpensesAsync(string? status = null, string? authToken = null)
    {
        try
        {
            AddAuthHeader(authToken);
            var url = "/api/finance/expenses";
            if (!string.IsNullOrEmpty(status))
            {
                url += $"?status={Uri.EscapeDataString(status)}";
            }
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var expenses = await response.Content.ReadFromJsonAsync<List<ExpenseDto>>(options);
            return expenses ?? new List<ExpenseDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching expenses from Finance service");
            return new List<ExpenseDto>();
        }
    }

    public async Task<List<ExpenseDto>> GetExpensesBySubmitterAsync(long employeeId, string? authToken = null)
    {
        try
        {
            AddAuthHeader(authToken);
            var response = await _httpClient.GetAsync($"/api/finance/expenses/by-submitter/{employeeId}");
            response.EnsureSuccessStatusCode();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var expenses = await response.Content.ReadFromJsonAsync<List<ExpenseDto>>(options);
            return expenses ?? new List<ExpenseDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching expenses for submitter {EmployeeId} from Finance service", employeeId);
            return new List<ExpenseDto>();
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

