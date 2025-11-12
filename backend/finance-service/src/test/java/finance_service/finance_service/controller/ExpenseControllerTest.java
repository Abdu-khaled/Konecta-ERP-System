package finance_service.finance_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import finance_service.finance_service.model.Expense;
import finance_service.finance_service.model.ExpenseStatus;
import finance_service.finance_service.security.JwtAuthFilter;
import finance_service.finance_service.security.SecurityConfig;
import finance_service.finance_service.service.ExpenseService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ExpenseController.class)
@Import(SecurityConfig.class)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private finance_service.finance_service.service.ExpenseImportService expenseImportService;

    @MockBean
    private finance_service.finance_service.security.JwtService jwtService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter; // mocked to bypass real token parsing

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
    @WithMockUser(roles = { "EMPLOYEE" })
    void submit_expense_allowed_for_employee() throws Exception {
        Expense saved = Expense.builder()
                .id(1L).submittedBy(5L).category("Travel").amount(120.5)
                .status(ExpenseStatus.PENDING)
                .build();
        given(expenseService.submit(any(Expense.class))).willReturn(saved);

        mvc.perform(post("/api/finance/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\n  \"submittedBy\": 5, \n \"category\": \"Travel\", \n \"amount\": 120.5, \n \"description\": \"Taxi\"\n}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = { "EMPLOYEE" })
    void approve_expense_forbidden_for_employee() throws Exception {
        mvc.perform(put("/api/finance/expenses/10/approve").param("approverId", "7"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = { "FINANCE" })
    void approve_expense_allowed_for_finance() throws Exception {
        Expense approved = new Expense();
        approved.setId(10L);
        approved.setStatus(ExpenseStatus.APPROVED);
        given(expenseService.approve(10L, 7L)).willReturn(approved);

        mvc.perform(put("/api/finance/expenses/10/approve").param("approverId", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}
