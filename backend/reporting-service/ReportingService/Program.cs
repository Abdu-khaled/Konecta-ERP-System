using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ReportingService.Data;
using ReportingService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Reporting Service API",
        Version = "v1",
        Description = "ERP Reporting Service for generating PDF/Excel reports and dashboard analytics"
    });
});

// Database connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// HTTP Clients for microservice communication
builder.Services.AddHttpClient<IHrServiceClient, HrServiceClient>(client =>
{
    var baseUrl = builder.Configuration["ServiceUrls:HrService"] ?? "http://localhost:8082";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddHttpClient<IFinanceServiceClient, FinanceServiceClient>(client =>
{
    var baseUrl = builder.Configuration["ServiceUrls:FinanceService"] ?? "http://localhost:8083";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Register services
builder.Services.AddScoped<IDataAggregationService, DataAggregationService>();
builder.Services.AddScoped<IPdfReportService, PdfReportService>();
builder.Services.AddScoped<IExcelReportService, ExcelReportService>();

// Allow frontend & other services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Reporting Service API v1");
    });
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();
app.Run();
