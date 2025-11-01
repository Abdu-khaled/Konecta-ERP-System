package auth_service.util;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

public class TokenGenerator {
    private static final SecureRandom random = new SecureRandom();

    public static String randomToken() {
        // UUID + 16 random bytes base64url without padding
        byte[] extra = new byte[16];
        random.nextBytes(extra);
        String b64 = Base64.getUrlEncoder().withoutPadding().encodeToString(extra);
        return UUID.randomUUID().toString().replaceAll("-", "") + b64;
    }
}

