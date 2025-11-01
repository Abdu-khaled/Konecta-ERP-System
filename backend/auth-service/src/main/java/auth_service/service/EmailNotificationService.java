package auth_service.service;

import auth_service.model.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "spring.mail", name = "host")
public class EmailNotificationService implements NotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@konecta.local}")
    private String from;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendInviteEmail(String email, String name, String link, Role role) {
        String subject = "Konecta ERP | Complete Your Registration";
        String text = "Hello " + (name != null ? name : "there") + ",\n\n" +
                "You have been invited to Konecta ERP with role: " + role + ".\n" +
                "Please complete your registration here: " + link + "\n\n" +
                "If you did not expect this email, you can ignore it.";
        send(email, subject, text);
    }

    @Override
    public void sendOtpEmail(String email, String name, String otpCode, int ttlSeconds) {
        String subject = "Konecta ERP | Your OTP Code";
        String text = "Hello " + (name != null ? name : "there") + ",\n\n" +
                "Your One-Time Password (OTP) is: " + otpCode + "\n" +
                "This code expires in " + ttlSeconds + " seconds.";
        send(email, subject, text);
    }

    private void send(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}

