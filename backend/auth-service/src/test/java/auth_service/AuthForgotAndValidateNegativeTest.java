package auth_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthForgotAndValidateNegativeTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void forgot_start_always_ok() throws Exception {
        mvc.perform(post("/api/auth/forgot/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\n  \"email\": \"nobody@example.com\"\n}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("reset_started"));
    }

    @Test
    void validate_invalid_token_returns_400() throws Exception {
        mvc.perform(post("/api/auth/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\n  \"token\": \"bad.token.value\"\n}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.valid").value(false));
    }
}
