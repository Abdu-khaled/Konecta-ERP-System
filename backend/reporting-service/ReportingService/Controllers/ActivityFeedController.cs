using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReportingService.Data;
using ReportingService.Models;
using ReportingService.Attributes;
using ReportingService.Helpers;

namespace ReportingService.Controllers
{
    [ApiController]
    [Route("api/reporting/feed")]
    public class ActivityFeedController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ActivityFeedController(AppDbContext db) { _db = db; }

        [HttpGet]
        [RoleAuthorization("ADMIN","MANAGER","HR","FINANCE","EMPLOYEE","INVENTORY","IT_OPERATION","SALES_ONLY","OPERATIONS")]
        public async Task<IActionResult> Get(
            [FromQuery] string? service = null,
            [FromQuery] string? routingKey = null,
            [FromQuery] string? role = null,
            [FromQuery] string? status = null,
            [FromQuery] string? action = null,
            [FromQuery] string? entityType = null,
            [FromQuery] string? month = null,
            [FromQuery] DateTime? since = null,
            [FromQuery] int limit = 100)
        {
            if (limit <= 0 || limit > 500) limit = 100;
            var q = _db.ActivityEvents.AsNoTracking().OrderByDescending(e => e.CreatedAt).AsQueryable();
            if (!string.IsNullOrWhiteSpace(service)) q = q.Where(e => e.Service == service);
            if (!string.IsNullOrWhiteSpace(routingKey)) q = q.Where(e => e.RoutingKey == routingKey);
            if (!string.IsNullOrWhiteSpace(role)) q = q.Where(e => e.Role == role);
            if (!string.IsNullOrWhiteSpace(status)) q = q.Where(e => e.Status == status);
            if (!string.IsNullOrWhiteSpace(action)) q = q.Where(e => e.Action == action);
            if (!string.IsNullOrWhiteSpace(entityType)) q = q.Where(e => e.EntityType == entityType);
            if (!string.IsNullOrWhiteSpace(month)) q = q.Where(e => e.MonthKey == month);
            if (since.HasValue) q = q.Where(e => e.CreatedAt >= since.Value);
            var items = await q.Take(limit).ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        [RoleAuthorization("ADMIN","MANAGER","HR","FINANCE","EMPLOYEE","INVENTORY","IT_OPERATION","SALES_ONLY","OPERATIONS")]
        public async Task<IActionResult> Create([FromBody] CreateActivityEventDto dto)
        {
            var now = DateTime.UtcNow;
            var status = string.IsNullOrWhiteSpace(dto.Status) ? "pushed" : dto.Status!;
            var monthKey = (dto.OccurredAt ?? now).ToString("yyyy-MM");
            var entity = new ActivityEvent
            {
                Service = string.IsNullOrWhiteSpace(dto.Service) ? "manual" : dto.Service!,
                RoutingKey = string.IsNullOrWhiteSpace(dto.RoutingKey) ? "manual.event" : dto.RoutingKey!,
                Payload = dto.Payload ?? string.Empty,
                CreatedAt = dto.OccurredAt ?? now,
                Role = dto.Role,
                ActorId = string.IsNullOrWhiteSpace(dto.ActorId) ? JwtHelper.GetUsernameFromToken(Request.Headers["Authorization"].FirstOrDefault()) : dto.ActorId,
                ActorName = string.IsNullOrWhiteSpace(dto.ActorName) ? JwtHelper.GetUsernameFromToken(Request.Headers["Authorization"].FirstOrDefault()) : dto.ActorName,
                Action = dto.Action,
                EntityType = dto.EntityType,
                EntityId = dto.EntityId,
                Title = dto.Title,
                Summary = dto.Summary,
                Status = status,
                MonthKey = monthKey
            };
            _db.ActivityEvents.Add(entity);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity);
        }

        [HttpPatch("{id}/push")]
        [RoleAuthorization("ADMIN","MANAGER","HR","FINANCE","EMPLOYEE")] // approvers checked below
        public async Task<IActionResult> Push(long id)
        {
            var ev = await _db.ActivityEvents.FirstOrDefaultAsync(x => x.Id == id);
            if (ev == null) return NotFound();
            if (ev.Status == "pushed") return Ok(ev);
            var token = Request.Headers["Authorization"].FirstOrDefault();
            var username = JwtHelper.GetUsernameFromToken(token);
            var role = JwtHelper.GetRoleFromToken(token)?.Replace("ROLE_", "");
            var isApprover = string.Equals(role, "ADMIN", StringComparison.OrdinalIgnoreCase) ||
                             string.Equals(role, "MANAGER", StringComparison.OrdinalIgnoreCase);
            var isOwner = !string.IsNullOrWhiteSpace(username) && string.Equals(username, ev.ActorId, StringComparison.OrdinalIgnoreCase);
            if (!(isOwner || isApprover)) return new ForbidResult();
            ev.Status = "pushed";
            await _db.SaveChangesAsync();
            return Ok(ev);
        }

        [HttpGet("summary/monthly")]
        public async Task<IActionResult> MonthlySummary([FromQuery] string? month = null)
        {
            var q = _db.ActivityEvents.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(month)) q = q.Where(e => e.MonthKey == month);
            var data = await q
                .GroupBy(e => new { e.MonthKey, e.Role, e.Action })
                .Select(g => new MonthlySummaryItem
                {
                    Month = g.Key.MonthKey ?? "",
                    Role = g.Key.Role ?? "",
                    Action = g.Key.Action ?? "",
                    Count = g.Count(),
                    LatestAt = g.Max(x => x.CreatedAt)
                })
                .OrderByDescending(x => x.Month)
                .ThenBy(x => x.Role)
                .ThenBy(x => x.Action)
                .ToListAsync();
            return Ok(data);
        }

        public class CreateActivityEventDto
        {
            public string? Service { get; set; }
            public string? RoutingKey { get; set; }
            public string? Payload { get; set; }
            public DateTime? OccurredAt { get; set; }
            public string? Role { get; set; }
            public string? ActorId { get; set; }
            public string? ActorName { get; set; }
            public string? Action { get; set; }
            public string? EntityType { get; set; }
            public string? EntityId { get; set; }
            public string? Title { get; set; }
            public string? Summary { get; set; }
            public string? Status { get; set; }
        }

        public class MonthlySummaryItem
        {
            public string Month { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
            public string Action { get; set; } = string.Empty;
            public int Count { get; set; }
            public DateTime LatestAt { get; set; }
        }
    }
}
