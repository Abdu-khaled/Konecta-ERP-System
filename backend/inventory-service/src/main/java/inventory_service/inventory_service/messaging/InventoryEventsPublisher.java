package inventory_service.inventory_service.messaging;

import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class InventoryEventsPublisher {
    private final AmqpTemplate amqpTemplate;
    private final TopicExchange eventsExchange;

    public InventoryEventsPublisher(AmqpTemplate amqpTemplate, TopicExchange eventsExchange) {
        this.amqpTemplate = amqpTemplate;
        this.eventsExchange = eventsExchange;
    }

    public void publishLowStock(Long productId, String sku, int quantity, int threshold) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("productId", productId);
        payload.put("sku", sku);
        payload.put("quantity", quantity);
        payload.put("threshold", threshold);
        payload.put("detectedAt", java.time.OffsetDateTime.now().toString());
        amqpTemplate.convertAndSend(eventsExchange.getName(), "inventory.low_stock", payload);
    }
}
