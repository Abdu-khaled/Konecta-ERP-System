package auth_service.messaging;

import auth_service.model.User;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class UserEventsPublisher {
    private final AmqpTemplate amqpTemplate;
    private final TopicExchange eventsExchange;

    public UserEventsPublisher(AmqpTemplate amqpTemplate, TopicExchange eventsExchange) {
        this.amqpTemplate = amqpTemplate;
        this.eventsExchange = eventsExchange;
    }

    public void publishUserActivated(User user) {
        if (user == null || user.getId() == null) return;
        Map<String, Object> payload = new HashMap<>();
        // Standard audit envelope
        payload.put("service", "auth-service");
        payload.put("role", user.getRole() != null ? user.getRole().name() : null);
        payload.put("actorId", null); // activated by system/admin - unknown here
        payload.put("actorName", null);
        payload.put("action", "user.activated");
        payload.put("entityType", "User");
        payload.put("entityId", String.valueOf(user.getId()));
        payload.put("title", "User activated");
        payload.put("summary", user.getUsername() + " (" + user.getEmail() + ") activated");
        payload.put("status", "pushed");
        payload.put("occurredAt", java.time.OffsetDateTime.now().toString());
        // raw extras
        payload.put("username", user.getUsername());
        payload.put("email", user.getEmail());
        amqpTemplate.convertAndSend(eventsExchange.getName(), "auth.user.activated", payload);
    }
}
