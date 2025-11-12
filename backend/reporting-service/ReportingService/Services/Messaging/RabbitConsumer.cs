using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using ReportingService.Data;
using ReportingService.Models;
using System.Text.Json;

namespace ReportingService.Services.Messaging
{
    public class RabbitConsumer : BackgroundService
    {
        private readonly ILogger<RabbitConsumer> _logger;
        private readonly IConfiguration _config;
        private IConnection? _connection;
        private IModel? _channel;
        private readonly IServiceScopeFactory _scopeFactory;

        public RabbitConsumer(ILogger<RabbitConsumer> logger, IConfiguration config, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _config = config;
            _scopeFactory = scopeFactory;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _config["RabbitMQ:Host"] ?? "localhost",
                    UserName = _config["RabbitMQ:Username"] ?? "guest",
                    Password = _config["RabbitMQ:Password"] ?? "guest",
                    DispatchConsumersAsync = true
                };
                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                const string exchange = "erp.events";
                _channel.ExchangeDeclare(exchange, ExchangeType.Topic, durable: true, autoDelete: false);
                var queue = _channel.QueueDeclare(queue: "reporting-service.events", durable: true, exclusive: false, autoDelete: false);
                _channel.QueueBind(queue.QueueName, exchange, routingKey: "#");

                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.Received += async (ch, ea) =>
                {
                    try
                    {
                        var body = ea.Body.ToArray();
                        var message = Encoding.UTF8.GetString(body);
                        var key = ea.RoutingKey;
                        _logger.LogInformation("[RabbitMQ] {Key} -> {Msg}", key, message);

                        // persist event
                        using var scope = _scopeFactory.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        var serviceName = key.Contains('.') ? key.Split('.')[0] : "unknown";
                        var now = DateTime.UtcNow;
                        var entity = new ActivityEvent
                        {
                            Service = serviceName,
                            RoutingKey = key,
                            Payload = message,
                            CreatedAt = now
                        };
                        try
                        {
                            using var doc = JsonDocument.Parse(message);
                            var root = doc.RootElement;
                            if (root.TryGetProperty("service", out var svc) && svc.ValueKind == JsonValueKind.String) entity.Service = svc.GetString()!;
                            if (root.TryGetProperty("role", out var role) && role.ValueKind == JsonValueKind.String) entity.Role = role.GetString();
                            if (root.TryGetProperty("actorId", out var actorId) && actorId.ValueKind == JsonValueKind.String) entity.ActorId = actorId.GetString();
                            if (root.TryGetProperty("actorName", out var actorName) && actorName.ValueKind == JsonValueKind.String) entity.ActorName = actorName.GetString();
                            if (root.TryGetProperty("action", out var action) && action.ValueKind == JsonValueKind.String) entity.Action = action.GetString();
                            if (root.TryGetProperty("entityType", out var et) && et.ValueKind == JsonValueKind.String) entity.EntityType = et.GetString();
                            if (root.TryGetProperty("entityId", out var eid) && eid.ValueKind == JsonValueKind.String) entity.EntityId = eid.GetString();
                            if (root.TryGetProperty("title", out var title) && title.ValueKind == JsonValueKind.String) entity.Title = title.GetString();
                            if (root.TryGetProperty("summary", out var summary) && summary.ValueKind == JsonValueKind.String) entity.Summary = summary.GetString();
                            if (root.TryGetProperty("status", out var status) && status.ValueKind == JsonValueKind.String) entity.Status = status.GetString();
                            DateTime occurredAt;
                            if (root.TryGetProperty("occurredAt", out var at) && at.ValueKind == JsonValueKind.String && DateTime.TryParse(at.GetString(), out occurredAt))
                            {
                                entity.CreatedAt = DateTime.SpecifyKind(occurredAt, DateTimeKind.Utc);
                            }
                            entity.MonthKey = entity.CreatedAt.ToString("yyyy-MM");
                        }
                        catch (Exception jex)
                        {
                            _logger.LogWarning(jex, "Failed to parse event JSON, storing raw only");
                            entity.MonthKey = now.ToString("yyyy-MM");
                        }
                        db.ActivityEvents.Add(entity);
                        await db.SaveChangesAsync();
                        _channel!.BasicAck(ea.DeliveryTag, multiple: false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "RabbitMQ consumer error");
                        // Nack and requeue once; a DLQ strategy can be added later.
                        _channel!.BasicNack(ea.DeliveryTag, multiple: false, requeue: true);
                    }
                    await Task.CompletedTask;
                };

                _channel.BasicConsume(queue.QueueName, autoAck: false, consumer: consumer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start RabbitMQ consumer");
            }

            return Task.CompletedTask;
        }

        public override void Dispose()
        {
            try { _channel?.Close(); } catch { }
            try { _connection?.Close(); } catch { }
            base.Dispose();
        }
    }
}
