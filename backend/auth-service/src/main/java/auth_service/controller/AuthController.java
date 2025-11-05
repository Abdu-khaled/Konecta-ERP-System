package auth_service.controller;

import auth_service.dto.*;
import auth_service.model.Role;
import auth_service.model.User;
import auth_service.model.UserStatus;
import auth_service.repository.UserRepository;
import auth_service.security.JwtService;
import auth_service.service.NotificationService;
import auth_service.service.OtpService;
import auth_service.util.TokenGenerator;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationService notificationService;
    private final OtpService otpService;
    private final long otpTtlSeconds;
    private final long verificationTtlMinutes;
    private final String registrationUrlBase;

    public AuthController(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            NotificationService notificationService,
            OtpService otpService,
            @Value("${app.otp.ttl-seconds:300}") long otpTtlSeconds,
            @Value("${app.verification.ttl-minutes:1440}") long verificationTtlMinutes,
            @Value("${app.registration.urlBase:http://localhost:4200/register}") String registrationUrlBase) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
        this.otpService = otpService;
        this.otpTtlSeconds = otpTtlSeconds;
        this.verificationTtlMinutes = verificationTtlMinutes;
        this.registrationUrlBase = registrationUrlBase;
    }

    @PostMapping("/users/invite")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<?> inviteUser(@Valid @RequestBody InviteUserRequest req) {
        var existing = userRepository.findByEmail(req.getEmail()).orElse(null);
        String token = TokenGenerator.randomToken();
        LocalDateTime tokenExp = LocalDateTime.now().plusMinutes(verificationTtlMinutes);
        User user;
        if (existing != null) {
            // If already active, do not allow re-invite
            if (existing.getStatus() == UserStatus.ACTIVE && Boolean.TRUE.equals(existing.getOtpVerified())) {
                return ResponseEntity.badRequest().body(Map.of("message", "email already registered and active"));
            }
            existing.setRole(req.getRole());
            existing.setFullName(req.getName());
            existing.setVerificationToken(token);
            existing.setVerificationExpiresAt(tokenExp);
            existing.setStatus(UserStatus.INACTIVE);
            existing.setOtpVerified(Boolean.FALSE);
            // Keep username as existing or fallback to email
            if (existing.getUsername() == null)
                existing.setUsername(existing.getEmail());
            if (existing.getPassword() == null)
                existing.setPassword(passwordEncoder.encode(TokenGenerator.randomToken()));
            user = userRepository.save(existing);
        } else {
            user = User.builder()
                    .username(req.getEmail())
                    .email(req.getEmail())
                    .fullName(req.getName())
                    .role(req.getRole())
                    .status(UserStatus.INACTIVE)
                    .otpVerified(Boolean.FALSE)
                    .password(passwordEncoder.encode(TokenGenerator.randomToken()))
                    .verificationToken(token)
                    .verificationExpiresAt(tokenExp)
                    .build();
            userRepository.save(user);
        }
        String link = registrationUrlBase + "?token=" + token;
        notificationService.sendInviteEmail(user.getEmail(), req.getName(), link, req.getRole());
        return ResponseEntity.ok(Map.of(
                "message", "invite sent",
                "id", user.getId(),
                "email", user.getEmail()));
    }

    @GetMapping({ "/registration/validate", "/register/validate" })
    public ResponseEntity<?> validateRegistrationToken(@RequestParam("token") String token) {
        var userOpt = userRepository.findByVerificationToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("valid", false, "reason", "not_found"));
        }
        var user = userOpt.get();
        if (user.getVerificationExpiresAt() != null && user.getVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.ok(Map.of("valid", false, "reason", "expired"));
        }
        if (user.getStatus() == UserStatus.ACTIVE && Boolean.TRUE.equals(user.getOtpVerified())) {
            return ResponseEntity.ok(Map.of("valid", false, "reason", "already_active"));
        }
        return ResponseEntity.ok(Map.of(
                "valid", true,
                "email", user.getEmail(),
                "name", user.getFullName(),
                "role", user.getRole().name()));
    }

    @PostMapping({ "/registration/complete", "/register/complete" })
    public ResponseEntity<?> completeRegistration(@Valid @RequestBody CompleteRegistrationRequest req) {
        var userOpt = userRepository.findByVerificationToken(req.getToken());
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "invalid token"));
        var user = userOpt.get();
        if (user.getVerificationExpiresAt() != null && user.getVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "verification token expired"));
        }
        // Update profile details
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            if (!req.getUsername().equals(user.getUsername()) && userRepository.existsByUsername(req.getUsername())) {
                return ResponseEntity.badRequest().body(Map.of("message", "username already exists"));
            }
            user.setUsername(req.getUsername());
        }
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        // Generate and send OTP
        String code = otpService.generateNumericCode(6);
        user.setOtpHash(otpService.hash(code));
        user.setOtpVerified(Boolean.FALSE);
        user.setOtpExpiresAt(LocalDateTime.now().plusSeconds(otpTtlSeconds));
        userRepository.save(user);

        notificationService.sendOtpEmail(user.getEmail(),
                user.getFullName() != null ? user.getFullName() : user.getUsername(), code, (int) otpTtlSeconds);
        return ResponseEntity.ok(Map.of(
                "message", "otp_sent",
                "delivery", "email",
                "expiresIn", otpTtlSeconds));
    }

    @PostMapping({ "/registration/verify-otp", "/register/verify-otp" })
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        var userOpt = userRepository.findByVerificationToken(req.getToken());
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "invalid token"));
        var user = userOpt.get();
        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "otp expired"));
        }
        if (!otpService.verify(req.getOtp(), user.getOtpHash())) {
            return ResponseEntity.status(400).body(Map.of("message", "invalid otp"));
        }
        user.setOtpVerified(Boolean.TRUE);
        user.setStatus(UserStatus.ACTIVE);
        // Invalidate verification token after success
        user.setVerificationToken(null);
        user.setVerificationExpiresAt(null);
        user.setOtpHash(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "account_activated"));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody UpdateRoleRequest req) {
        if (req == null || req.getRole() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "role is required"));
        }
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(req.getRole());
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                            "message", "role updated",
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "email", user.getEmail(),
                            "role", user.getRole().name()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(403).body(Map.of("message", "self-registration disabled; ask admin to invite"));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<?> listUsers(@RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "role", required = false) String roleStr) {
        var users = userRepository.findAll();
        Role parsedRole = null;
        if (roleStr != null && !roleStr.isBlank()) {
            try {
                parsedRole = Role.valueOf(roleStr.toUpperCase());
            } catch (Exception ignored) {
            }
        }
        final Role roleFilter = parsedRole;
        return ResponseEntity.ok(
                users.stream()
                        .filter(u -> roleFilter == null || (u.getRole() != null && u.getRole() == roleFilter))
                        .filter(u -> {
                            if (q == null || q.isBlank())
                                return true;
                            String s = q.toLowerCase();
                            return (u.getUsername() != null && u.getUsername().toLowerCase().contains(s))
                                    || (u.getEmail() != null && u.getEmail().toLowerCase().contains(s))
                                    || (u.getFullName() != null && u.getFullName().toLowerCase().contains(s))
                                    || (u.getRole() != null && u.getRole().name().toLowerCase().contains(s));
                        })
                        .map(u -> new auth_service.dto.UserListItem(
                                u.getId(),
                                u.getUsername(),
                                u.getFullName(),
                                u.getEmail(),
                                u.getPhone(),
                                u.getRole(),
                                u.getStatus(),
                                u.getOtpVerified(),
                                u.getCreatedAt()))
                        .toList());
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest req) {
        return userRepository.findById(id)
                .map(u -> {
                    if (req.getFullName() != null) u.setFullName(req.getFullName());
                    if (req.getPhone() != null) u.setPhone(req.getPhone());
                    userRepository.save(u);
                    return ResponseEntity.ok(Map.of(
                            "message", "user updated",
                            "id", u.getId(),
                            "fullName", u.getFullName(),
                            "phone", u.getPhone()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> {
                    userRepository.deleteById(id);
                    return ResponseEntity.ok(Map.of("message", "user deleted"));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null || user.getPassword() == null
                || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "invalid credentials"));
        }
        if (user.getStatus() != UserStatus.ACTIVE || !Boolean.TRUE.equals(user.getOtpVerified())) {
            return ResponseEntity.status(403).body(Map.of("message", "account not activated"));
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("uid", user.getId());
        // include username as claim; set token subject to the email so downstream
        // services can reliably resolve Employee by email
        claims.put("username", user.getUsername());
        String token = jwtService.generateToken(user.getEmail(), claims);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> me() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).build();
        }
        String subject = auth.getName();
        return userRepository.findByUsername(subject)
                .or(() -> userRepository.findByEmail(subject))
                .map(user -> ResponseEntity
                        .ok(new ProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole())))
                .orElseGet(() -> ResponseEntity.status(404).build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@Valid @RequestBody auth_service.dto.UpdateSelfRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).build();
        }
        String subject = auth.getName();
        return userRepository.findByUsername(subject)
                .or(() -> userRepository.findByEmail(subject))
                .map(user -> {
                    if (req.getUsername() != null && !req.getUsername().isBlank()) {
                        String newUsername = req.getUsername().trim();
                        // Allow keeping same username; block duplicates
                        if (!newUsername.equalsIgnoreCase(user.getUsername()) && userRepository.existsByUsername(newUsername)) {
                            return ResponseEntity.badRequest().body(Map.of("message", "username already taken"));
                        }
                        user.setUsername(newUsername);
                    }
                    if (req.getPassword() != null && !req.getPassword().isBlank()) {
                        if (req.getConfirmPassword() == null || !req.getPassword().equals(req.getConfirmPassword())) {
                            return ResponseEntity.badRequest().body(Map.of("message", "passwords do not match"));
                        }
                        user.setPassword(passwordEncoder.encode(req.getPassword()));
                    }
                    userRepository.save(user);
                    return ResponseEntity.ok(new ProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole()));
                })
                .orElseGet(() -> ResponseEntity.status(404).build());
    }

    // Forgot password flow
    @PostMapping("/forgot/start")
    public ResponseEntity<?> forgotStart(@Valid @RequestBody auth_service.dto.ForgotStartRequest req) {
        var userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            // Always respond success to avoid user enumeration
            return ResponseEntity.ok(Map.of("message", "reset_started"));
        }
        var user = userOpt.get();
        String code = otpService.generateNumericCode(6);
        user.setOtpHash(otpService.hash(code));
        user.setOtpExpiresAt(LocalDateTime.now().plusSeconds(otpTtlSeconds));
        userRepository.save(user);
        notificationService.sendOtpEmail(user.getEmail(),
                user.getFullName() != null ? user.getFullName() : user.getUsername(), code, (int) otpTtlSeconds);
        return ResponseEntity.ok(Map.of("message", "otp_sent", "expiresIn", otpTtlSeconds));
    }

    @PostMapping("/forgot/complete")
    public ResponseEntity<?> forgotComplete(@Valid @RequestBody auth_service.dto.ForgotCompleteRequest req) {
        var userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            // Do not leak user existence
            return ResponseEntity.ok(Map.of("message", "password_reset"));
        }
        var user = userOpt.get();
        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "otp expired"));
        }
        if (!otpService.verify(req.getOtp(), user.getOtpHash())) {
            return ResponseEntity.status(400).body(Map.of("message", "invalid otp"));
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "passwords do not match"));
        }
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setOtpHash(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "password_reset"));
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        try {
            var jws = jwtService.validate(token);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "sub", jws.getBody().getSubject(),
                    "exp", jws.getBody().getExpiration(),
                    "role", jws.getBody().get("role")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", e.getMessage()));
        }
    }
}