package auth_service.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpRateLimiter {
    private static class AttemptInfo {
        int failures;
        long blockedUntilMs;
        long lastFailureMs;
    }

    private final Map<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    // Policy
    private static final int SOFT_FAIL_LIMIT = 5;           // after 5 failures, short block
    private static final long SOFT_BLOCK_SECONDS = 60;      // 60 seconds
    private static final int HARD_FAIL_LIMIT = 10;          // after 10 failures, block for the rest of OTP TTL (caller passes)

    public boolean isBlocked(String token) {
        if (token == null || token.isBlank()) return false;
        AttemptInfo info = attempts.get(token);
        if (info == null) return false;
        long now = System.currentTimeMillis();
        return info.blockedUntilMs > now;
    }

    public long getRetryAfterSeconds(String token) {
        AttemptInfo info = attempts.get(token);
        if (info == null) return 0;
        long now = System.currentTimeMillis();
        long deltaMs = Math.max(0, info.blockedUntilMs - now);
        return (deltaMs + 999) / 1000; // ceil to seconds
    }

    public void onFailure(String token, long otpTtlSeconds) {
        if (token == null || token.isBlank()) return;
        long now = System.currentTimeMillis();
        AttemptInfo info = attempts.computeIfAbsent(token, t -> new AttemptInfo());
        info.failures += 1;
        info.lastFailureMs = now;
        if (info.failures >= HARD_FAIL_LIMIT) {
            info.blockedUntilMs = now + (otpTtlSeconds * 1000L);
        } else if (info.failures >= SOFT_FAIL_LIMIT) {
            info.blockedUntilMs = Math.max(info.blockedUntilMs, now + (SOFT_BLOCK_SECONDS * 1000L));
        }
    }

    public void onSuccess(String token) {
        if (token == null || token.isBlank()) return;
        attempts.remove(token);
    }
}
