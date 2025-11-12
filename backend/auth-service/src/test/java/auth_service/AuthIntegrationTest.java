package auth_service;

import auth_service.model.Role;
import auth_service.model.User;
import auth_service.model.UserStatus;
import auth_service.repository.UserRepository;
import auth_service.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private NotificationService notificationService;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();
        doNothing().when(notificationService).sendInviteEmail(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
        doNothing().when(notificationService).sendOtpEmail(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyInt());
        userRepository.save(User.builder()
                .username("employee@example.com")
                .email("employee@example.com")
                .fullName("Employee One")
                .role(Role.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .otpVerified(Boolean.TRUE)
                .password(passwordEncoder.encode("changeme"))
                .build());
    }

    @Test
    void login_success_and_validate_token() throws Exception {
        String res = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\n  \"email\": \"employee@example.com\",\n  \"password\": \"changeme\"\n}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn().getResponse().getContentAsString();

        String token = res.replaceAll(".*\\\"token\\\":\\\"([^\\\"]+)\\\".*", "$1");

        mvc.perform(post("/api/auth/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\n  \"token\": \"" + token + "\"\n}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.role").exists());
    }

    @Test
    void login_invalid_credentials() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\n  \"email\": \"employee@example.com\",\n  \"password\": \"wrong\"\n}"))
                .andExpect(status().isUnauthorized());
    }
}
