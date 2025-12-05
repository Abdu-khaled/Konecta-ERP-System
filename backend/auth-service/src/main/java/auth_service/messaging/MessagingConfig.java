package auth_service.messaging;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessagingConfig {
    public static final String EVENTS_EXCHANGE = "erp.events";

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(EVENTS_EXCHANGE, true, false);
    }

    @Bean
    public MessageConverter messageConverter() {
        // Serialize all published and consumed RabbitMQ messages as JSON
        // so they can be safely shared across services (including .NET).
        return new Jackson2JsonMessageConverter();
    }
}
