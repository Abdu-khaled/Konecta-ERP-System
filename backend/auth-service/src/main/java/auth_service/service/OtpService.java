package auth_service.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class OtpService {
    private final SecureRandom random = new SecureRandom();
    private final PasswordEncoder passwordEncoder;

    public OtpService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public String generateNumericCode(int digits) {
        int max = (int) Math.pow(10, digits) - 1;
        int min = (int) Math.pow(10, digits - 1);
        int num = random.nextInt(max - min + 1) + min;
        return String.format("%0" + digits + "d", num);
    }

    public String hash(String code) {
        return passwordEncoder.encode(code);
    }

    public boolean verify(String code, String hash) {
        if (code == null || hash == null) return false;
        return passwordEncoder.matches(code, hash);
    }
}

