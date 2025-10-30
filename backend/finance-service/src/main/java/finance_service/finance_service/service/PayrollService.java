package finance_service.finance_service.service;

import finance_service.finance_service.dto.request.PayrollRequest;
import finance_service.finance_service.model.Payroll;
import finance_service.finance_service.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final RestTemplateBuilder restTemplateBuilder;

    private Double fetchBaseSalaryFromHr(Long employeeId) {
        try {
            RestTemplate rt = restTemplateBuilder.build();
            // Prefer container DNS when running in Docker; otherwise localhost mapping
            String[] candidates = new String[]{
                    "http://hr-service:8082/api/hr/employees/" + employeeId,
                    "http://localhost:8088/api/hr/employees/" + employeeId
            };
            for (String url : candidates) {
                try {
                    ResponseEntity<Map> resp = rt.getForEntity(url, Map.class);
                    if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null && resp.getBody().get("salary") != null) {
                        Object val = resp.getBody().get("salary");
                        return Double.valueOf(val.toString());
                    }
                } catch (Exception ignored) { }
            }
        } catch (Exception ignored) { }
        return null;
    }

    public Payroll calculateAndSave(PayrollRequest req) {
        Double base = req.getBaseSalary();
        if (base == null) {
            base = fetchBaseSalaryFromHr(req.getEmployeeId());
        }
        if (base == null) {
            base = 0.0; // fallback to avoid NPE; caller can update later
        }
        double bonuses = req.getBonuses() != null ? req.getBonuses() : 0.0;
        double deductions = req.getDeductions() != null ? req.getDeductions() : 0.0;
        double net = base + bonuses - deductions;

        // Upsert by (employeeId, period) to avoid duplicates
        Payroll p = payrollRepository
                .findTopByEmployeeIdAndPeriodOrderByProcessedDateDescIdDesc(req.getEmployeeId(), req.getPeriod())
                .orElseGet(() -> Payroll.builder()
                        .employeeId(req.getEmployeeId())
                        .period(req.getPeriod())
                        .build());
        p.setBaseSalary(base);
        p.setBonuses(bonuses);
        p.setDeductions(deductions);
        p.setNetSalary(net);
        p.setProcessedDate(LocalDate.now());
        return payrollRepository.save(p);
    }

    public Payroll getByEmployeeAndPeriod(Long employeeId, String period) {
        // If duplicates exist, prefer the most recent
        return payrollRepository.findTopByEmployeeIdAndPeriodOrderByProcessedDateDescIdDesc(employeeId, period).orElse(null);
    }
}
