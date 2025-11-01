using Microsoft.AspNetCore.Mvc;
using ReportingService.Attributes;
using ReportingService.Models;
using ReportingService.Models.Dtos;
using ReportingService.Services;

namespace ReportingService.Controllers
{
    [ApiController]
    [Route("api/report")]
    public class ReportController : ControllerBase
    {
        private readonly IDataAggregationService _dataAggregationService;
        private readonly IPdfReportService _pdfReportService;
        private readonly IExcelReportService _excelReportService;
        private readonly IHrServiceClient _hrClient;
        private readonly IFinanceServiceClient _financeClient;
        private readonly ILogger<ReportController> _logger;

        public ReportController(
            IDataAggregationService dataAggregationService,
            IPdfReportService pdfReportService,
            IExcelReportService excelReportService,
            IHrServiceClient hrClient,
            IFinanceServiceClient financeClient,
            ILogger<ReportController> logger)
        {
            _dataAggregationService = dataAggregationService;
            _pdfReportService = pdfReportService;
            _excelReportService = excelReportService;
            _hrClient = hrClient;
            _financeClient = financeClient;
            _logger = logger;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Reporting Service (ASP.NET Core) is running!");
        }

        [HttpGet("dashboard")]
        [RoleAuthorization("ADMIN", "MANAGER", "HR", "FINANCE")]
        public async Task<ActionResult<DashboardAnalyticsDto>> GetDashboardAnalytics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? period = null)
        {
            var authToken = Request.Headers["Authorization"].FirstOrDefault();
            var analytics = await _dataAggregationService.GetDashboardAnalyticsAsync(
                startDate, endDate, period, authToken);
            
            return Ok(analytics);
        }

        [HttpPost("export")]
        [RoleAuthorization("ADMIN", "MANAGER", "HR", "FINANCE")]
        public async Task<IActionResult> ExportReport([FromBody] ReportRequest request)
        {
            var authToken = Request.Headers["Authorization"].FirstOrDefault();
            byte[] reportBytes;
            string contentType;
            string fileName;

            try
            {
                switch (request.Type)
                {
                    case ReportType.PayrollSummary:
                        if (string.IsNullOrEmpty(request.Period))
                            return BadRequest("Period is required for payroll reports");

                        var payrolls = await _dataAggregationService.AggregatePayrollDataAsync(request.Period, authToken);
                        
                        if (request.Format == ExportFormat.Pdf)
                        {
                            reportBytes = await _pdfReportService.GeneratePayrollReportAsync(payrolls, request.Period);
                            contentType = "application/pdf";
                            fileName = $"PayrollReport_{request.Period}.pdf";
                        }
                        else
                        {
                            reportBytes = await _excelReportService.GeneratePayrollReportAsync(payrolls, request.Period);
                            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                            fileName = $"PayrollReport_{request.Period}.xlsx";
                        }
                        break;

                    case ReportType.AttendanceReport:
                        var startDate = request.StartDate ?? DateTime.Now.AddMonths(-1);
                        var endDate = request.EndDate ?? DateTime.Now;
                        var attendance = await _dataAggregationService.AggregateAttendanceDataAsync(
                            startDate, endDate, request.EmployeeId, authToken);
                        
                        if (request.Format == ExportFormat.Pdf)
                        {
                            reportBytes = await _pdfReportService.GenerateAttendanceReportAsync(attendance, startDate, endDate);
                            contentType = "application/pdf";
                            fileName = $"AttendanceReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
                        }
                        else
                        {
                            reportBytes = await _excelReportService.GenerateAttendanceReportAsync(attendance, startDate, endDate);
                            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                            fileName = $"AttendanceReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.xlsx";
                        }
                        break;

                    case ReportType.FinancialSummary:
                        startDate = request.StartDate ?? DateTime.Now.AddMonths(-1);
                        endDate = request.EndDate ?? DateTime.Now;
                        var financialSummary = await _dataAggregationService.AggregateFinancialDataAsync(
                            startDate, endDate, authToken);
                        var invoices = await _financeClient.GetInvoicesAsync(null, authToken);
                        var expenses = await _financeClient.GetExpensesAsync(null, authToken);
                        
                        if (request.Format == ExportFormat.Pdf)
                        {
                            reportBytes = await _pdfReportService.GenerateFinancialReportAsync(financialSummary, invoices, expenses);
                            contentType = "application/pdf";
                            fileName = $"FinancialReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
                        }
                        else
                        {
                            reportBytes = await _excelReportService.GenerateFinancialReportAsync(financialSummary, invoices, expenses);
                            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                            fileName = $"FinancialReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.xlsx";
                        }
                        break;

                    case ReportType.EmployeeReport:
                        if (!request.EmployeeId.HasValue)
                            return BadRequest("EmployeeId is required for employee reports");

                        var employee = await _hrClient.GetEmployeeByIdAsync(request.EmployeeId.Value, authToken);
                        if (employee == null)
                            return NotFound($"Employee with ID {request.EmployeeId} not found");

                        startDate = request.StartDate ?? DateTime.Now.AddMonths(-6);
                        endDate = request.EndDate ?? DateTime.Now;
                        var empAttendance = await _hrClient.GetAttendanceByEmployeeAsync(request.EmployeeId.Value, authToken);
                        empAttendance = empAttendance.Where(a => a.Date >= startDate && a.Date <= endDate).ToList();

                        // Get payroll for employee (last 6 months)
                        var period = request.Period ?? $"{DateTime.Now.Year}-{DateTime.Now.Month:D2}";
                        var empPayroll = await _financeClient.GetPayrollByEmployeeAsync(request.EmployeeId.Value, period, authToken);
                        var empPayrolls = empPayroll != null ? new List<PayrollDto> { empPayroll } : new List<PayrollDto>();
                        
                        if (request.Format == ExportFormat.Pdf)
                        {
                            reportBytes = await _pdfReportService.GenerateEmployeeReportAsync(employee, empAttendance, empPayrolls);
                            contentType = "application/pdf";
                            fileName = $"EmployeeReport_{employee.Id}_{DateTime.Now:yyyyMMdd}.pdf";
                        }
                        else
                        {
                            reportBytes = await _excelReportService.GenerateEmployeeReportAsync(employee, empAttendance, empPayrolls);
                            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                            fileName = $"EmployeeReport_{employee.Id}_{DateTime.Now:yyyyMMdd}.xlsx";
                        }
                        break;

                    default:
                        return BadRequest($"Unsupported report type: {request.Type}");
                }

                return File(reportBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report of type {Type}", request.Type);
                return StatusCode(500, $"Error generating report: {ex.Message}");
            }
        }

        [HttpGet("export/payroll")]
        [RoleAuthorization("ADMIN", "MANAGER", "FINANCE")]
        public async Task<IActionResult> ExportPayrollReport(
            [FromQuery] string period,
            [FromQuery] ExportFormat format = ExportFormat.Pdf)
        {
            var authToken = Request.Headers["Authorization"].FirstOrDefault();
            var payrolls = await _dataAggregationService.AggregatePayrollDataAsync(period, authToken);
            
            byte[] reportBytes;
            string contentType;
            string fileName;

            if (format == ExportFormat.Pdf)
            {
                reportBytes = await _pdfReportService.GeneratePayrollReportAsync(payrolls, period);
                contentType = "application/pdf";
                fileName = $"PayrollReport_{period}.pdf";
            }
            else
            {
                reportBytes = await _excelReportService.GeneratePayrollReportAsync(payrolls, period);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = $"PayrollReport_{period}.xlsx";
            }

            return File(reportBytes, contentType, fileName);
        }

        [HttpGet("export/attendance")]
        [RoleAuthorization("ADMIN", "MANAGER", "HR")]
        public async Task<IActionResult> ExportAttendanceReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] long? employeeId = null,
            [FromQuery] ExportFormat format = ExportFormat.Pdf)
        {
            startDate ??= DateTime.Now.AddMonths(-1);
            endDate ??= DateTime.Now;

            var authToken = Request.Headers["Authorization"].FirstOrDefault();
            var attendance = await _dataAggregationService.AggregateAttendanceDataAsync(
                startDate.Value, endDate.Value, employeeId, authToken);
            
            byte[] reportBytes;
            string contentType;
            string fileName;

            if (format == ExportFormat.Pdf)
            {
                reportBytes = await _pdfReportService.GenerateAttendanceReportAsync(attendance, startDate.Value, endDate.Value);
                contentType = "application/pdf";
                fileName = $"AttendanceReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
            }
            else
            {
                reportBytes = await _excelReportService.GenerateAttendanceReportAsync(attendance, startDate.Value, endDate.Value);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = $"AttendanceReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.xlsx";
            }

            return File(reportBytes, contentType, fileName);
        }

        [HttpGet("export/financial")]
        [RoleAuthorization("ADMIN", "MANAGER", "FINANCE")]
        public async Task<IActionResult> ExportFinancialReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] ExportFormat format = ExportFormat.Pdf)
        {
            startDate ??= DateTime.Now.AddMonths(-1);
            endDate ??= DateTime.Now;

            var authToken = Request.Headers["Authorization"].FirstOrDefault();
            var summary = await _dataAggregationService.AggregateFinancialDataAsync(
                startDate.Value, endDate.Value, authToken);
            var invoices = await _financeClient.GetInvoicesAsync(null, authToken);
            var expenses = await _financeClient.GetExpensesAsync(null, authToken);
            
            byte[] reportBytes;
            string contentType;
            string fileName;

            if (format == ExportFormat.Pdf)
            {
                reportBytes = await _pdfReportService.GenerateFinancialReportAsync(summary, invoices, expenses);
                contentType = "application/pdf";
                fileName = $"FinancialReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
            }
            else
            {
                reportBytes = await _excelReportService.GenerateFinancialReportAsync(summary, invoices, expenses);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = $"FinancialReport_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.xlsx";
            }

            return File(reportBytes, contentType, fileName);
        }

        [HttpGet("export/employee/{employeeId}")]
        [RoleAuthorization("ADMIN", "MANAGER", "HR", "FINANCE", "EMPLOYEE")]
        public async Task<IActionResult> ExportEmployeeReport(
            [FromRoute] long employeeId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] ExportFormat format = ExportFormat.Pdf)
        {
            var authToken = Request.Headers["Authorization"].FirstOrDefault();
            var employee = await _hrClient.GetEmployeeByIdAsync(employeeId, authToken);
            
            if (employee == null)
                return NotFound($"Employee with ID {employeeId} not found");

            startDate ??= DateTime.Now.AddMonths(-6);
            endDate ??= DateTime.Now;

            var attendance = await _hrClient.GetAttendanceByEmployeeAsync(employeeId, authToken);
            attendance = attendance.Where(a => a.Date >= startDate && a.Date <= endDate).ToList();

            var period = $"{DateTime.Now.Year}-{DateTime.Now.Month:D2}";
            var payroll = await _financeClient.GetPayrollByEmployeeAsync(employeeId, period, authToken);
            var payrolls = payroll != null ? new List<PayrollDto> { payroll } : new List<PayrollDto>();
            
            byte[] reportBytes;
            string contentType;
            string fileName;

            if (format == ExportFormat.Pdf)
            {
                reportBytes = await _pdfReportService.GenerateEmployeeReportAsync(employee, attendance, payrolls);
                contentType = "application/pdf";
                fileName = $"EmployeeReport_{employee.Id}_{DateTime.Now:yyyyMMdd}.pdf";
            }
            else
            {
                reportBytes = await _excelReportService.GenerateEmployeeReportAsync(employee, attendance, payrolls);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = $"EmployeeReport_{employee.Id}_{DateTime.Now:yyyyMMdd}.xlsx";
            }

            return File(reportBytes, contentType, fileName);
        }
    }
}

