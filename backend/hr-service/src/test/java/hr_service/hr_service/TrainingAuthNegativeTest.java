package hr_service.hr_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TrainingAuthNegativeTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void endpoints_require_authentication() throws Exception {
        mvc.perform(get("/api/hr/training")).andExpect(status().isForbidden());
        mvc.perform(post("/api/hr/training/1/enroll")).andExpect(status().isForbidden());
        mvc.perform(get("/api/hr/training/enrollments/1/certificate")).andExpect(status().isForbidden());
        mvc.perform(post("/api/hr/training/enrollments/1/certificate-email")).andExpect(status().isForbidden());
    }
}
