package finance_service.finance_service.service;

import finance_service.finance_service.dto.request.PayrollRequest;
import finance_service.finance_service.model.Payroll;
import finance_service.finance_service.repository.PayrollRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PayrollServiceTest {

    @Mock
    private PayrollRepository payrollRepository;

    @Mock
    private RestTemplateBuilder restTemplateBuilder;

    @Mock
    private RestTemplate restTemplate;

    @Captor
    private ArgumentCaptor<Payroll> payrollCaptor;

    private PayrollService payrollService;

    @BeforeEach
    void setUp() {
        payrollService = new PayrollService(payrollRepository, restTemplateBuilder);
    }

    @Test
    void calculateAndSave_usesProvidedBaseSalary() {
        given(payrollRepository.save(any(Payroll.class))).willAnswer(inv -> {
            Payroll p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        PayrollRequest req = new PayrollRequest();
        req.setEmployeeId(7L);
        req.setPeriod("2025-01");
        req.setBaseSalary(3000.0);
        req.setBonuses(200.0);
        req.setDeductions(50.0);

        Payroll saved = payrollService.calculateAndSave(req);

        verify(payrollRepository).save(payrollCaptor.capture());
        Payroll toSave = payrollCaptor.getValue();

        assertThat(saved.getId()).isEqualTo(1L);
        assertThat(toSave.getNetSalary()).isEqualTo(3150.0);
        assertThat(toSave.getProcessedDate()).isNotNull();
        assertThat(toSave.getEmployeeId()).isEqualTo(7L);
        assertThat(toSave.getPeriod()).isEqualTo("2025-01");
    }

    @Test
    void calculateAndSave_whenNoBaseSalary_fallsBackToZero() {
        given(payrollRepository.save(any(Payroll.class))).willAnswer(inv -> inv.getArgument(0));
        // RestTemplate is used only on this path; provide builder stub here
        given(restTemplateBuilder.build()).willReturn(restTemplate);
        // Any remote call will throw; service should catch and return null base -> 0.0
        given(restTemplate.getForEntity(anyString(), eq(java.util.Map.class)))
                .willThrow(new RuntimeException("HR not reachable"));

        PayrollRequest req = new PayrollRequest();
        req.setEmployeeId(5L);
        req.setPeriod("2025-02");
        req.setBonuses(100.0);
        req.setDeductions(50.0);

        Payroll saved = payrollService.calculateAndSave(req);

        assertThat(saved.getNetSalary()).isEqualTo(50.0);
        assertThat(saved.getProcessedDate()).isEqualTo(LocalDate.now());
    }
}
