package finance_service.finance_service.messaging;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UserActivatedConsumer {

    @RabbitListener(queues = MessagingConfig.FINANCE_QUEUE)
    public void onUserActivated(@Payload Map<String, Object> payload) {
        // Placeholder for future upsert of finance account info
        Object userId = payload.get("userId");
        Object email = payload.get("email");
        // no-op
    }
}
