using Microsoft.EntityFrameworkCore;
using ReportingService.Models;

namespace ReportingService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

       
        public DbSet<ActivityEvent> ActivityEvents { get; set; } = null!;
    }
}