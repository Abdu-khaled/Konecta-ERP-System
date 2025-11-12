using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ReportingService.Models.Dtos;
using Microsoft.Extensions.Logging;

namespace ReportingService.Services;

public class PdfReportService : IPdfReportService
{
    private readonly ILogger<PdfReportService> _logger;

    public PdfReportService(ILogger<PdfReportService> logger)
    {
        _logger = logger;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public Task<byte[]> GeneratePayrollReportAsync(List<PayrollDto> payrolls, string period)
    {
        try
        {
            var safeList = payrolls ?? new List<PayrollDto>();
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header()
                        .Text($"Payroll Report - {period}")
                        .SemiBold().FontSize(16).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Item().Text($"Period: {period}").SemiBold();
                            column.Item().Text($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}").FontSize(8).FontColor(Colors.Grey.Medium);
                            column.Item().PaddingTop(10);

                            // Summary
                            var totalPayroll = safeList.Sum(p => p.NetSalary);
                            var avgSalary = safeList.Any() ? safeList.Average(p => p.NetSalary) : 0;
                            column.Item().Text($"Total Payroll: ${totalPayroll:F2}").SemiBold();
                            column.Item().Text($"Average Salary: ${avgSalary:F2}");
                            column.Item().Text($"Employee Count: {safeList.Count}");
                            column.Item().PaddingTop(10);

                            // Table
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("Employee ID").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Base Salary").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Bonuses").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Deductions").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Net Salary").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Date").SemiBold();
                                });

                                foreach (var payroll in safeList)
                                {
                                    table.Cell().Element(CellStyle).Text(payroll.EmployeeId.ToString());
                                    table.Cell().Element(CellStyle).Text($"${payroll.BaseSalary:F2}");
                                    table.Cell().Element(CellStyle).Text($"${payroll.Bonuses:F2}");
                                    table.Cell().Element(CellStyle).Text($"${payroll.Deductions:F2}");
                                    table.Cell().Element(CellStyle).Text($"${payroll.NetSalary:F2}").SemiBold();
                                    table.Cell().Element(CellStyle).Text(payroll.ProcessedDate?.ToString("yyyy-MM-dd") ?? "N/A");
                                }
                            });
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Page ");
                            x.CurrentPageNumber();
                            x.Span(" of ");
                            x.TotalPages();
                        });
                });
            });

            return Task.FromResult(document.GeneratePdf());
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Invalid operation while generating payroll PDF for period {Period}", period);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating payroll PDF for period {Period}", period);
            throw;
        }
    }

    public Task<byte[]> GenerateAttendanceReportAsync(List<AttendanceDto> attendance, DateTime startDate, DateTime endDate)
    {
        try
        {
            var safeList = attendance ?? new List<AttendanceDto>();
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header()
                        .Text($"Attendance Report")
                        .SemiBold().FontSize(16).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Item().Text($"Period: {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}").SemiBold();
                            column.Item().Text($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}").FontSize(8).FontColor(Colors.Grey.Medium);
                            column.Item().PaddingTop(10);

                            // Summary
                            var presentDays = attendance.Count(a => a.Present);
                            var totalDays = attendance.Count;
                            var avgHours = attendance.Any() ? attendance.Where(a => a.WorkingHours.HasValue).Select(a => (double)a.WorkingHours!.Value).DefaultIfEmpty(0).Average() : 0;
                            column.Item().Text($"Total Records: {totalDays}").SemiBold();
                            column.Item().Text($"Present Days: {presentDays}");
                            column.Item().Text($"Average Working Hours: {avgHours:F2}");
                            column.Item().PaddingTop(10);

                            // Group by employee
                            var grouped = attendance.GroupBy(a => a.EmployeeId).ToList();
                            
                            foreach (var group in grouped)
                            {
                                column.Item().PaddingTop(5).Text($"Employee ID: {group.Key}").SemiBold();
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Element(CellStyle).Text("Date").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Present").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Hours").SemiBold();
                                    });

                                    foreach (var record in group.OrderBy(a => a.Date))
                                    {
                                        table.Cell().Element(CellStyle).Text(record.Date.ToString("yyyy-MM-dd"));
                                        table.Cell().Element(CellStyle).Text(record.Present ? "Yes" : "No");
                                        table.Cell().Element(CellStyle).Text((record.WorkingHours ?? 0m).ToString("F2"));
                                    }
                                });
                                column.Item().PaddingBottom(10);
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Page ");
                            x.CurrentPageNumber();
                            x.Span(" of ");
                            x.TotalPages();
                        });
                });
            });

            return Task.FromResult(document.GeneratePdf());
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Invalid operation while generating attendance PDF {Start} - {End}", startDate, endDate);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating attendance PDF {Start} - {End}", startDate, endDate);
            throw;
        }
    }

    public Task<byte[]> GenerateFinancialReportAsync(FinancialSummaryDto summary, List<InvoiceDto> invoices, List<ExpenseDto> expenses)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Text("Financial Summary Report")
                    .SemiBold().FontSize(16).FontColor(Colors.Blue.Medium);

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        column.Item().Text($"Period: {summary.StartDate:yyyy-MM-dd} to {summary.EndDate:yyyy-MM-dd}").SemiBold();
                        column.Item().Text($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}").FontSize(8).FontColor(Colors.Grey.Medium);
                        column.Item().PaddingTop(10);

                        // Financial Summary
                        column.Item().PaddingTop(5).Text("Financial Summary").SemiBold().FontSize(12);
                        column.Item().Text($"Total Revenue: ${summary.TotalRevenue:F2}").SemiBold();
                        column.Item().Text($"Total Expenses: ${summary.TotalExpenses:F2}");
                        column.Item().Text($"Net Income: ${summary.NetIncome:F2}").FontColor(summary.NetIncome >= 0 ? Colors.Green.Medium : Colors.Red.Medium);
                        column.Item().Text($"Total Invoices: {summary.TotalInvoices}");
                        column.Item().Text($"Pending Expenses: {summary.PendingExpenses}");
                        column.Item().PaddingTop(10);

                        // Recent Invoices
                        column.Item().PaddingTop(5).Text("Recent Invoices").SemiBold().FontSize(12);
                        var recentInvoices = invoices.OrderByDescending(i => i.InvoiceDate).Take(20).ToList();
                        
                        if (recentInvoices.Any())
                        {
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("ID").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Client").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Date").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Amount").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Status").SemiBold();
                                });

                                foreach (var invoice in recentInvoices)
                                {
                                    table.Cell().Element(CellStyle).Text(invoice.Id.ToString());
                                    table.Cell().Element(CellStyle).Text(invoice.ClientName);
                                    table.Cell().Element(CellStyle).Text(invoice.InvoiceDate.ToString("yyyy-MM-dd"));
                                    table.Cell().Element(CellStyle).Text($"${invoice.Amount:F2}");
                                    table.Cell().Element(CellStyle).Text(invoice.Status);
                                }
                            });
                        }

                        column.Item().PaddingTop(10);

                        // Recent Expenses
                        column.Item().PaddingTop(5).Text("Recent Expenses").SemiBold().FontSize(12);
                        var recentExpenses = expenses.OrderByDescending(e => e.CreatedAt).Take(20).ToList();
                        
                        if (recentExpenses.Any())
                        {
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("ID").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Category").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Amount").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Status").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Date").SemiBold();
                                });

                                foreach (var expense in recentExpenses)
                                {
                                    table.Cell().Element(CellStyle).Text(expense.Id.ToString());
                                    table.Cell().Element(CellStyle).Text(expense.Category);
                                    table.Cell().Element(CellStyle).Text($"${expense.Amount:F2}");
                                    table.Cell().Element(CellStyle).Text(expense.Status);
                                    table.Cell().Element(CellStyle).Text(expense.CreatedAt.ToString("yyyy-MM-dd"));
                                }
                            });
                        }
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
            });
        });

        return Task.FromResult(document.GeneratePdf());
    }

    public Task<byte[]> GenerateEmployeeReportAsync(EmployeeDto employee, List<AttendanceDto> attendance, List<PayrollDto> payrolls)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Text($"Employee Report - {employee.FirstName} {employee.LastName}")
                    .SemiBold().FontSize(16).FontColor(Colors.Blue.Medium);

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        column.Item().Text($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}").FontSize(8).FontColor(Colors.Grey.Medium);
                        column.Item().PaddingTop(10);

                        // Employee Information
                        column.Item().Text("Employee Information").SemiBold().FontSize(12);
                        column.Item().Text($"ID: {employee.Id}");
                        column.Item().Text($"Name: {employee.FirstName} {employee.LastName}");
                        column.Item().Text($"Email: {employee.Email ?? "N/A"}");
                        column.Item().Text($"Department: {employee.Department ?? "N/A"}");
                        column.Item().Text($"Position: {employee.Position ?? "N/A"}");
                        column.Item().Text($"Hire Date: {employee.HireDate?.ToString("yyyy-MM-dd") ?? "N/A"}");
                        column.Item().PaddingTop(10);

                        // Attendance Summary
                        if (attendance.Any())
                        {
                            column.Item().PaddingTop(5).Text("Attendance Summary").SemiBold().FontSize(12);
                            var presentDays = attendance.Count(a => a.Present);
                            var totalDays = attendance.Count;
                            column.Item().Text($"Total Days: {totalDays}");
                            column.Item().Text($"Present Days: {presentDays}");
                            column.Item().Text($"Attendance Rate: {(totalDays > 0 ? (double)presentDays / totalDays * 100 : 0):F2}%");
                            column.Item().Text($"Average Working Hours: {(attendance.Any() ? attendance.Where(a => a.WorkingHours.HasValue).Select(a => (double)a.WorkingHours!.Value).DefaultIfEmpty(0).Average() : 0):F2}");
                            column.Item().PaddingTop(10);
                        }

                        // Payroll Summary
                        if (payrolls.Any())
                        {
                            column.Item().PaddingTop(5).Text("Payroll Summary").SemiBold().FontSize(12);
                            var totalSalary = payrolls.Sum(p => p.NetSalary);
                            column.Item().Text($"Total Salary: ${totalSalary:F2}");
                            column.Item().Text($"Payroll Records: {payrolls.Count}");
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("Period").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Base Salary").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Net Salary").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Date").SemiBold();
                                });

                                foreach (var payroll in payrolls.OrderByDescending(p => p.Period))
                                {
                                    table.Cell().Element(CellStyle).Text(payroll.Period);
                                    table.Cell().Element(CellStyle).Text($"${payroll.BaseSalary:F2}");
                                    table.Cell().Element(CellStyle).Text($"${payroll.NetSalary:F2}");
                                    table.Cell().Element(CellStyle).Text(payroll.ProcessedDate?.ToString("yyyy-MM-dd") ?? "N/A");
                                }
                            });
                        }
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
            });
        });

        return Task.FromResult(document.GeneratePdf());
    }

    private static IContainer CellStyle(IContainer container)
    {
        return container
            .Border(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(5)
            .Background(Colors.White);
    }
}

