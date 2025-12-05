package hr_service.hr_service.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.HashMap;
import java.util.Map;

@EnableRabbit
@Configuration
public class MessagingConfig {
    public static final String EVENTS_EXCHANGE = "erp.events";
    public static final String DLX_EXCHANGE = "erp.dlq";
    public static final String HR_QUEUE = "hr-service.events";
    public static final String HR_DLQ = "hr-service.events.dlq";

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(EVENTS_EXCHANGE, true, false);
    }

    @Bean
    public TopicExchange dlxExchange() {
        return new TopicExchange(DLX_EXCHANGE, true, false);
    }

    @Bean
    public Queue hrQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLX_EXCHANGE);
        args.put("x-dead-letter-routing-key", HR_QUEUE);
        return new Queue(HR_QUEUE, true, false, false, args);
    }

    @Bean
    public Binding hrBinding(Queue hrQueue, TopicExchange eventsExchange) {
        return BindingBuilder.bind(hrQueue).to(eventsExchange).with("auth.user.activated");
    }

    @Bean
    public Queue hrDlq() {
        return new Queue(HR_DLQ, true);
    }

    @Bean
    public Binding hrDlqBinding(Queue hrDlq, TopicExchange dlxExchange) {
        // Route dead letters of HR_QUEUE to HR_DLQ using routing-key = HR_QUEUE
        return BindingBuilder.bind(hrDlq).to(dlxExchange).with(HR_QUEUE);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
