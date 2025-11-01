package auth_service.service;

import auth_service.model.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingBean(NotificationService.class)
public class ConsoleNotificationService implements NotificationService {
    private static final Logger log = LoggerFactory.getLogger(ConsoleNotificationService.class);

    @Override
    public void sendInviteEmail(String email, String name, String link, Role role) {
        log.info("[EMAIL] To: {} | Subject: ERP Registration | Hello {}, complete registration: {} | Role: {}",
                email, name, link, role);
    }

    @Override
    public void sendOtpEmail(String email, String name, String otpCode, int ttlSeconds) {
        log.info("[EMAIL] To: {} | Subject: ERP OTP | Hello {}, your OTP is {} (expires in {}s)",
                email, name, otpCode, ttlSeconds);
    }
}
