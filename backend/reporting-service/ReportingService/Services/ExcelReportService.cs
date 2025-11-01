using OfficeOpenXml;
using OfficeOpenXml.Style;
using ReportingService.Models.Dtos;

namespace ReportingService.Services;

public class ExcelReportService : IExcelReportService
{
    public ExcelReportService()
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    }

    public Task<byte[]> GeneratePayrollReportAsync(List<PayrollDto> payrolls, string period)
    {
        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Payroll Report");

        // Title
        worksheet.Cells[1, 1].Value = $"Payroll Report - {period}";
        worksheet.Cells[1, 1, 1, 6].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

        // Summary
        worksheet.Cells[3, 1].Value = "Period:";
        worksheet.Cells[3, 2].Value = period;
        worksheet.Cells[4, 1].Value = "Total Payroll:";
        worksheet.Cells[4, 2].Value = payrolls.Sum(p => p.NetSalary);
        worksheet.Cells[4, 2].Style.Numberformat.Format = "$#,##0.00";
        worksheet.Cells[5, 1].Value = "Average Salary:";
        worksheet.Cells[5, 2].Value = payrolls.Any() ? payrolls.Average(p => p.NetSalary) : 0;
        worksheet.Cells[5, 2].Style.Numberformat.Format = "$#,##0.00";
        worksheet.Cells[6, 1].Value = "Employee Count:";
        worksheet.Cells[6, 2].Value = payrolls.Count;

        // Headers
        int row = 8;
        worksheet.Cells[row, 1].Value = "Employee ID";
        worksheet.Cells[row, 2].Value = "Period";
        worksheet.Cells[row, 3].Value = "Base Salary";
        worksheet.Cells[row, 4].Value = "Bonuses";
        worksheet.Cells[row, 5].Value = "Deductions";
        worksheet.Cells[row, 6].Value = "Net Salary";
        worksheet.Cells[row, 7].Value = "Processed Date";

        var headerRange = worksheet.Cells[row, 1, row, 7];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);

        // Data
        row++;
        foreach (var payroll in payrolls)
        {
            worksheet.Cells[row, 1].Value = payroll.EmployeeId;
            worksheet.Cells[row, 2].Value = payroll.Period;
            worksheet.Cells[row, 3].Value = payroll.BaseSalary;
            worksheet.Cells[row, 3].Style.Numberformat.Format = "$#,##0.00";
            worksheet.Cells[row, 4].Value = payroll.Bonuses;
            worksheet.Cells[row, 4].Style.Numberformat.Format = "$#,##0.00";
            worksheet.Cells[row, 5].Value = payroll.Deductions;
            worksheet.Cells[row, 5].Style.Numberformat.Format = "$#,##0.00";
            worksheet.Cells[row, 6].Value = payroll.NetSalary;
            worksheet.Cells[row, 6].Style.Numberformat.Format = "$#,##0.00";
            worksheet.Cells[row, 6].Style.Font.Bold = true;
            worksheet.Cells[row, 7].Value = payroll.ProcessedDate?.ToString("yyyy-MM-dd");
            
            var dataRange = worksheet.Cells[row, 1, row, 7];
            dataRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
            row++;
        }

        // Auto-fit columns
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

        return Task.FromResult(package.GetAsByteArray());
    }

    public Task<byte[]> GenerateAttendanceReportAsync(List<AttendanceDto> attendance, DateTime startDate, DateTime endDate)
    {
        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Attendance Report");

        // Title
        worksheet.Cells[1, 1].Value = $"Attendance Report";
        worksheet.Cells[1, 1, 1, 4].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;
        worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

        // Summary
        worksheet.Cells[3, 1].Value = "Period:";
        worksheet.Cells[3, 2].Value = $"{startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}";
        worksheet.Cells[4, 1].Value = "Total Records:";
        worksheet.Cells[4, 2].Value = attendance.Count;
        var presentDays = attendance.Count(a => a.Present);
        worksheet.Cells[5, 1].Value = "Present Days:";
        worksheet.Cells[5, 2].Value = presentDays;
        worksheet.Cells[6, 1].Value = "Average Hours:";
        worksheet.Cells[6, 2].Value = attendance.Any() ? attendance.Average(a => a.WorkingHours) : 0;
        worksheet.Cells[6, 2].Style.Numberformat.Format = "0.00";

        // Headers
        int row = 8;
        worksheet.Cells[row, 1].Value = "Employee ID";
        worksheet.Cells[row, 2].Value = "Date";
        worksheet.Cells[row, 3].Value = "Present";
        worksheet.Cells[row, 4].Value = "Working Hours";

        var headerRange = worksheet.Cells[row, 1, row, 4];
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
        headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGreen);
        headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);

        // Data
        row++;
        foreach (var record in attendance.OrderBy(a => a.EmployeeId).ThenBy(a => a.Date))
        {
            worksheet.Cells[row, 1].Value = record.EmployeeId;
            worksheet.Cells[row, 2].Value = record.Date.ToString("yyyy-MM-dd");
            worksheet.Cells[row, 3].Value = record.Present ? "Yes" : "No";
            worksheet.Cells[row, 4].Value = record.WorkingHours;
            worksheet.Cells[row, 4].Style.Numberformat.Format = "0.00";
            
            var dataRange = worksheet.Cells[row, 1, row, 4];
            dataRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
            row++;
        }

        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

        return Task.FromResult(package.GetAsByteArray());
    }

    public Task<byte[]> GenerateFinancialReportAsync(FinancialSummaryDto summary, List<InvoiceDto> invoices, List<ExpenseDto> expenses)
    {
        using var package = new ExcelPackage();

        // Summary Sheet
        var summarySheet = package.Workbook.Worksheets.Add("Financial Summary");
        summarySheet.Cells[1, 1].Value = "Financial Summary Report";
        summarySheet.Cells[1, 1, 1, 2].Merge = true;
        summarySheet.Cells[1, 1].Style.Font.Size = 16;
        summarySheet.Cells[1, 1].Style.Font.Bold = true;

        int row = 3;
        summarySheet.Cells[row, 1].Value = "Period:";
        summarySheet.Cells[row++, 2].Value = $"{summary.StartDate:yyyy-MM-dd} to {summary.EndDate:yyyy-MM-dd}";
        summarySheet.Cells[row, 1].Value = "Total Revenue:";
        summarySheet.Cells[row, 2].Value = summary.TotalRevenue;
        summarySheet.Cells[row++, 2].Style.Numberformat.Format = "$#,##0.00";
        summarySheet.Cells[row, 1].Value = "Total Expenses:";
        summarySheet.Cells[row, 2].Value = summary.TotalExpenses;
        summarySheet.Cells[row++, 2].Style.Numberformat.Format = "$#,##0.00";
        summarySheet.Cells[row, 1].Value = "Net Income:";
        summarySheet.Cells[row, 2].Value = summary.NetIncome;
        summarySheet.Cells[row, 2].Style.Numberformat.Format = "$#,##0.00";
        summarySheet.Cells[row++, 2].Style.Font.Color.SetColor(summary.NetIncome >= 0 ? System.Drawing.Color.Green : System.Drawing.Color.Red);
        summarySheet.Cells[row, 1].Value = "Total Invoices:";
        summarySheet.Cells[row++, 2].Value = summary.TotalInvoices;
        summarySheet.Cells[row, 1].Value = "Pending Expenses:";
        summarySheet.Cells[row, 2].Value = summary.PendingExpenses;

        summarySheet.Cells[summarySheet.Dimension.Address].AutoFitColumns();

        // Invoices Sheet
        var invoicesSheet = package.Workbook.Worksheets.Add("Invoices");
        invoicesSheet.Cells[1, 1].Value = "ID";
        invoicesSheet.Cells[1, 2].Value = "Client Name";
        invoicesSheet.Cells[1, 3].Value = "Date";
        invoicesSheet.Cells[1, 4].Value = "Amount";
        invoicesSheet.Cells[1, 5].Value = "Status";

        var invoiceHeader = invoicesSheet.Cells[1, 1, 1, 5];
        invoiceHeader.Style.Font.Bold = true;
        invoiceHeader.Style.Fill.PatternType = ExcelFillStyle.Solid;
        invoiceHeader.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);

        row = 2;
        foreach (var invoice in invoices.OrderByDescending(i => i.InvoiceDate))
        {
            invoicesSheet.Cells[row, 1].Value = invoice.Id;
            invoicesSheet.Cells[row, 2].Value = invoice.ClientName;
            invoicesSheet.Cells[row, 3].Value = invoice.InvoiceDate.ToString("yyyy-MM-dd");
            invoicesSheet.Cells[row, 4].Value = invoice.Amount;
            invoicesSheet.Cells[row, 4].Style.Numberformat.Format = "$#,##0.00";
            invoicesSheet.Cells[row, 5].Value = invoice.Status;
            row++;
        }

        invoicesSheet.Cells[invoicesSheet.Dimension.Address].AutoFitColumns();

        // Expenses Sheet
        var expensesSheet = package.Workbook.Worksheets.Add("Expenses");
        expensesSheet.Cells[1, 1].Value = "ID";
        expensesSheet.Cells[1, 2].Value = "Category";
        expensesSheet.Cells[1, 3].Value = "Amount";
        expensesSheet.Cells[1, 4].Value = "Status";
        expensesSheet.Cells[1, 5].Value = "Submitted By";
        expensesSheet.Cells[1, 6].Value = "Date";

        var expenseHeader = expensesSheet.Cells[1, 1, 1, 6];
        expenseHeader.Style.Font.Bold = true;
        expenseHeader.Style.Fill.PatternType = ExcelFillStyle.Solid;
        expenseHeader.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightYellow);

        row = 2;
        foreach (var expense in expenses.OrderByDescending(e => e.CreatedAt))
        {
            expensesSheet.Cells[row, 1].Value = expense.Id;
            expensesSheet.Cells[row, 2].Value = expense.Category;
            expensesSheet.Cells[row, 3].Value = expense.Amount;
            expensesSheet.Cells[row, 3].Style.Numberformat.Format = "$#,##0.00";
            expensesSheet.Cells[row, 4].Value = expense.Status;
            expensesSheet.Cells[row, 5].Value = expense.SubmittedBy;
            expensesSheet.Cells[row, 6].Value = expense.CreatedAt.ToString("yyyy-MM-dd");
            row++;
        }

        expensesSheet.Cells[expensesSheet.Dimension.Address].AutoFitColumns();

        return Task.FromResult(package.GetAsByteArray());
    }

    public Task<byte[]> GenerateEmployeeReportAsync(EmployeeDto employee, List<AttendanceDto> attendance, List<PayrollDto> payrolls)
    {
        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Employee Report");

        // Title
        worksheet.Cells[1, 1].Value = $"Employee Report - {employee.FirstName} {employee.LastName}";
        worksheet.Cells[1, 1, 1, 4].Merge = true;
        worksheet.Cells[1, 1].Style.Font.Size = 16;
        worksheet.Cells[1, 1].Style.Font.Bold = true;

        // Employee Info
        int row = 3;
        worksheet.Cells[row, 1].Value = "Employee Information";
        worksheet.Cells[row, 1].Style.Font.Bold = true;
        worksheet.Cells[row, 1].Style.Font.Size = 12;
        row++;
        worksheet.Cells[row, 1].Value = "ID:";
        worksheet.Cells[row++, 2].Value = employee.Id;
        worksheet.Cells[row, 1].Value = "Name:";
        worksheet.Cells[row++, 2].Value = $"{employee.FirstName} {employee.LastName}";
        worksheet.Cells[row, 1].Value = "Email:";
        worksheet.Cells[row++, 2].Value = employee.Email ?? "N/A";
        worksheet.Cells[row, 1].Value = "Department:";
        worksheet.Cells[row++, 2].Value = employee.Department ?? "N/A";
        worksheet.Cells[row, 1].Value = "Position:";
        worksheet.Cells[row++, 2].Value = employee.Position ?? "N/A";

        // Attendance
        if (attendance.Any())
        {
            row++;
            worksheet.Cells[row, 1].Value = "Attendance Summary";
            worksheet.Cells[row, 1].Style.Font.Bold = true;
            worksheet.Cells[row, 1].Style.Font.Size = 12;
            row++;
            var presentDays = attendance.Count(a => a.Present);
            worksheet.Cells[row, 1].Value = "Present Days:";
            worksheet.Cells[row++, 2].Value = presentDays;
            worksheet.Cells[row, 1].Value = "Total Days:";
            worksheet.Cells[row++, 2].Value = attendance.Count;
            worksheet.Cells[row, 1].Value = "Attendance Rate:";
            worksheet.Cells[row, 2].Value = attendance.Count > 0 ? (double)presentDays / attendance.Count * 100 : 0;
            worksheet.Cells[row++, 2].Style.Numberformat.Format = "0.00%";
        }

        // Payroll
        if (payrolls.Any())
        {
            row += 2;
            worksheet.Cells[row, 1].Value = "Payroll Records";
            worksheet.Cells[row, 1].Style.Font.Bold = true;
            row++;
            worksheet.Cells[row, 1].Value = "Period";
            worksheet.Cells[row, 2].Value = "Base Salary";
            worksheet.Cells[row, 3].Value = "Net Salary";
            worksheet.Cells[row, 4].Value = "Date";
            
            var payrollHeader = worksheet.Cells[row, 1, row, 4];
            payrollHeader.Style.Font.Bold = true;
            payrollHeader.Style.Fill.PatternType = ExcelFillStyle.Solid;
            payrollHeader.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);

            row++;
            foreach (var payroll in payrolls.OrderByDescending(p => p.Period))
            {
                worksheet.Cells[row, 1].Value = payroll.Period;
                worksheet.Cells[row, 2].Value = payroll.BaseSalary;
                worksheet.Cells[row, 2].Style.Numberformat.Format = "$#,##0.00";
                worksheet.Cells[row, 3].Value = payroll.NetSalary;
                worksheet.Cells[row, 3].Style.Numberformat.Format = "$#,##0.00";
                worksheet.Cells[row, 4].Value = payroll.ProcessedDate?.ToString("yyyy-MM-dd");
                row++;
            }
        }

        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

        return Task.FromResult(package.GetAsByteArray());
    }
}

