package hr_service.hr_service.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

@Component
public class ActivityEventPublisher {
    private final RabbitTemplate rabbitTemplate;
    private final TopicExchange eventsExchange;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ActivityEventPublisher(RabbitTemplate rabbitTemplate, TopicExchange eventsExchange) {
        this.rabbitTemplate = rabbitTemplate;
        this.eventsExchange = eventsExchange;
    }

    public void publish(String actionKey, String entityType, String entityId, String title, String summary, String status, Authentication auth) {
        String routingKey = "hr." + entityType.toLowerCase() + "." + actionKey;
        Map<String, Object> payload = new HashMap<>();
        payload.put("service", "hr-service");
        payload.put("role", deriveRole(auth));
        payload.put("actorId", auth != null ? auth.getName() : null);
        payload.put("actorName", auth != null ? auth.getName() : null);
        payload.put("action", entityType.toLowerCase() + "." + actionKey);
        payload.put("entityType", entityType);
        payload.put("entityId", entityId);
        payload.put("title", title);
        payload.put("summary", summary);
        payload.put("status", status);
        payload.put("occurredAt", OffsetDateTime.now(ZoneOffset.UTC).toString());
        try {
            String json = objectMapper.writeValueAsString(payload);
            rabbitTemplate.convertAndSend(eventsExchange.getName(), routingKey, json);
        } catch (Exception ignored) {
        }
    }

    private String deriveRole(Authentication auth) {
        if (auth == null) return null;
        for (GrantedAuthority a : auth.getAuthorities()) {
            String name = a.getAuthority();
            if (name != null && name.startsWith("ROLE_")) {
                String r = name.substring(5);
                if ("ADMIN".equals(r) || "HR".equals(r) || "FINANCE".equals(r) || "EMPLOYEE".equals(r)) {
                    return r;
                }
            }
        }
        return null;
    }
}
