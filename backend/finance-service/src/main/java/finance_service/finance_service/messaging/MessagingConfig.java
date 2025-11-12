package finance_service.finance_service.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.HashMap;
import java.util.Map;

@EnableRabbit
@Configuration
public class MessagingConfig {
    public static final String EVENTS_EXCHANGE = "erp.events";
    public static final String DLX_EXCHANGE = "erp.dlq";
    public static final String FINANCE_QUEUE = "finance-service.events";
    public static final String FINANCE_DLQ = "finance-service.events.dlq";

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(EVENTS_EXCHANGE, true, false);
    }

    @Bean
    public Queue financeQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLX_EXCHANGE);
        args.put("x-dead-letter-routing-key", FINANCE_QUEUE);
        return new Queue(FINANCE_QUEUE, true, false, false, args);
    }

    @Bean
    public TopicExchange dlxExchange() { return new TopicExchange(DLX_EXCHANGE, true, false); }

    // Finance consumes user activation to ensure account info (future implementation)
    @Bean
    public Binding onUserActivatedBinding(Queue financeQueue, TopicExchange eventsExchange) {
        return BindingBuilder.bind(financeQueue).to(eventsExchange).with("auth.user.activated");
    }

    @Bean
    public Queue financeDlq() { return new Queue(FINANCE_DLQ, true); }

    @Bean
    public Binding financeDlqBinding(Queue financeDlq, TopicExchange dlxExchange) {
        return BindingBuilder.bind(financeDlq).to(dlxExchange).with(FINANCE_QUEUE);
    }
}
