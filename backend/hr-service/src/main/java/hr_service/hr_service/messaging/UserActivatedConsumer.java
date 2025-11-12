package hr_service.hr_service.messaging;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UserActivatedConsumer {

    @RabbitListener(queues = MessagingConfig.HR_QUEUE)
    public void onUserActivated(@Payload Map<String, Object> payload) {
        // Minimal, idempotent placeholder: just accept and proceed.
        // In future: upsert employee record based on email/username.
        // This is intentionally lightweight to keep builds green.
        Object email = payload.get("email");
        Object username = payload.get("username");
        // no-op
    }
}
