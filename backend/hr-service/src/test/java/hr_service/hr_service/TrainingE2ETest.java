package hr_service.hr_service;

import hr_service.hr_service.dto.request.TrainingRequest;
import hr_service.hr_service.service.CertificateEmailService;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.time.LocalDate;
import java.util.Date;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TrainingE2ETest {

    @Autowired
    private MockMvc mvc;

    // Make the Optional<CertificateEmailService> present in controller
    @MockBean
    private CertificateEmailService certificateEmailService;

    private static final String SECRET_BASE64 = "i0eCF0g/9rj5xLQOpPT2xWHDyKtqzjnE220yTdrjJwI8/w1NtH7xB9/T8MqqHaAn";

    private String makeToken(String subjectEmail, String role) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_BASE64));
        long now = System.currentTimeMillis();
        return io.jsonwebtoken.Jwts.builder()
                .setClaims(Map.of(
                        "role", role,
                        "uid", 1,
                        "username", subjectEmail
                ))
                .setSubject(subjectEmail)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + 3600_000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    void endToEnd_training_workflow_backend_only() throws Exception {
        // Arrange: HR creates a training program
        String hrToken = makeToken("hr@example.com", "HR");
        TrainingRequest req = new TrainingRequest();
        req.setTitle("JUnit E2E Program");
        req.setDescription("Automated E2E seed");
        req.setStartDate(LocalDate.now());
        req.setEndDate(LocalDate.now().plusDays(1));
        req.setInstructor("QA Bot");
        req.setLocation("Remote");

        String createJson = "{" +
                "\"title\":\"" + req.getTitle() + "\"," +
                "\"description\":\"" + req.getDescription() + "\"," +
                "\"startDate\":\"" + req.getStartDate() + "\"," +
                "\"endDate\":\"" + req.getEndDate() + "\"," +
                "\"instructor\":\"" + req.getInstructor() + "\"," +
                "\"location\":\"" + req.getLocation() + "\"}";

        String programId = mvc.perform(post("/api/hr/training")
                        .header("Authorization", "Bearer " + hrToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn().getResponse().getContentAsString();

        // Extract id with a simple find (avoid JSON lib to keep test lightweight)
        String idVal = programId.replaceAll(".*\\\"id\\\":(\\d+).*", "$1");

        // Act: Employee enrolls in the created program
        String employeeEmail = "employee@example.com";
        String empToken = makeToken(employeeEmail, "EMPLOYEE");
        String enrollRes = mvc.perform(post("/api/hr/training/" + idVal + "/enroll")
                        .header("Authorization", "Bearer " + empToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn().getResponse().getContentAsString();
        String enrollmentId = enrollRes.replaceAll(".*\\\"id\\\":(\\d+).*", "$1");

        // Assert: Download certificate works and returns a PDF
        mvc.perform(get("/api/hr/training/enrollments/" + enrollmentId + "/certificate")
                        .header("Authorization", "Bearer " + empToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("application/pdf")))
                .andExpect(header().string("Content-Disposition", containsString("attachment")));

        // Arrange: Mock email sender to no-op
        doNothing().when(certificateEmailService).sendCertificate(any(), any(), any(), any(), any());

        // Assert: Send certificate email returns 204
        mvc.perform(post("/api/hr/training/enrollments/" + enrollmentId + "/certificate-email")
                        .header("Authorization", "Bearer " + empToken))
                .andExpect(status().isNoContent());
    }
}
