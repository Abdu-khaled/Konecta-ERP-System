package auth_service.service;

import auth_service.model.Role;

public interface NotificationService {
    void sendInviteEmail(String email, String name, String link, Role role);
    void sendOtpEmail(String email, String name, String otpCode, int ttlSeconds);
}

