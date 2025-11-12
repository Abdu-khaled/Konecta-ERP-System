using System;

namespace ReportingService.Models
{
    public class ActivityEvent
    {
        public long Id { get; set; }
        public string Service { get; set; } = string.Empty; // e.g., auth-service, hr-service
        public string RoutingKey { get; set; } = string.Empty; // e.g., hr.employee.created
        public string Payload { get; set; } = string.Empty; // raw JSON envelope
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Enriched fields for audit feed
        public string? Role { get; set; } // HR, Finance, Admin, etc.
        public string? ActorId { get; set; }
        public string? ActorName { get; set; }
        public string? Action { get; set; } // e.g., employee.created
        public string? EntityType { get; set; } // e.g., Employee
        public string? EntityId { get; set; } // e.g., E-1002
        public string? Title { get; set; }
        public string? Summary { get; set; }
        public string? Status { get; set; } // draft|pushed
        public string? MonthKey { get; set; } // yyyy-MM
    }
}
