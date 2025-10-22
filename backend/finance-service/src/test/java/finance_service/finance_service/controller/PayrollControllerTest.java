package finance_service.finance_service.controller;

import finance_service.finance_service.model.Payroll;
import finance_service.finance_service.security.JwtAuthFilter;
import finance_service.finance_service.security.SecurityConfig;
import finance_service.finance_service.service.PayrollService;
import finance_service.finance_service.repository.PayrollRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PayrollController.class)
@Import(SecurityConfig.class)
class PayrollControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private PayrollService payrollService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private PayrollRepository payrollRepository; // required by controller constructor

    @BeforeEach
    void passThroughJwtFilter() throws Exception {
        doAnswer(inv -> {
            jakarta.servlet.http.HttpServletRequest req = inv.getArgument(0);
            jakarta.servlet.http.HttpServletResponse res = inv.getArgument(1);
            jakarta.servlet.FilterChain chain = inv.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any());
    }

    @Test
    @WithMockUser(roles = { "FINANCE" })
    void calculate_allowed_for_finance() throws Exception {
        Payroll p = Payroll.builder().id(1L).employeeId(7L).period("2025-01").netSalary(3150.0).build();
        given(payrollService.calculateAndSave(any())).willReturn(p);

        mvc.perform(post("/api/finance/payroll/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\n  \"employeeId\": 7, \n \"period\": \"2025-01\", \n \"baseSalary\": 3000, \n \"bonuses\": 200, \n \"deductions\": 50\n}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.netSalary").value(3150.0));
    }

    @Test
    @WithMockUser(roles = { "EMPLOYEE" })
    void calculate_forbidden_for_employee() throws Exception {
        mvc.perform(post("/api/finance/payroll/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\n  \"employeeId\": 7, \n \"period\": \"2025-01\"\n}"))
                .andExpect(status().isForbidden());
    }
}
