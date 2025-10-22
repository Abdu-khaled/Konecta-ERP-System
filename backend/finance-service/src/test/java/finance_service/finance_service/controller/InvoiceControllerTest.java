package finance_service.finance_service.controller;

import finance_service.finance_service.model.Invoice;
import finance_service.finance_service.model.InvoiceStatus;
import finance_service.finance_service.security.JwtAuthFilter;
import finance_service.finance_service.security.SecurityConfig;
import finance_service.finance_service.service.InvoiceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = InvoiceController.class)
@Import(SecurityConfig.class)
class InvoiceControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private InvoiceService invoiceService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

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
    void create_invoice_allowed_for_finance() throws Exception {
        Invoice i = Invoice.builder().id(2L).clientName("ACME").invoiceDate(LocalDate.parse("2025-01-16"))
                .amount(2500.0).status(InvoiceStatus.DRAFT).build();
        given(invoiceService.create(any())).willReturn(i);

        mvc.perform(post("/api/finance/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\n  \"clientName\": \"ACME\", \n \"invoiceDate\": \"2025-01-16\", \n \"amount\": 2500\n}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }
}
