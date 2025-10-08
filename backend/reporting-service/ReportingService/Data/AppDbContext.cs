using Microsoft.EntityFrameworkCore;

namespace ReportingService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // TODO: Add your DbSet<TEntity> properties here, e.g.:
        // public DbSet<Report> Reports { get; set; } = null!;
    }
}
