package finance_service.finance_service.controller;

import finance_service.finance_service.dto.request.PayrollRequest;
import finance_service.finance_service.dto.response.PayrollResponse;
import finance_service.finance_service.model.Payroll;
import finance_service.finance_service.repository.PayrollRepository;
import finance_service.finance_service.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final PayrollRepository payrollRepository;

    @PostMapping("/calculate")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<PayrollResponse> calculate(@RequestBody PayrollRequest req) {
        Payroll saved = payrollService.calculateAndSave(req);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<PayrollResponse> byEmployeeAndPeriod(@PathVariable Long employeeId, @RequestParam String period) {
        Payroll p = payrollService.getByEmployeeAndPeriod(employeeId, period);
        return p != null ? ResponseEntity.ok(toResponse(p)) : ResponseEntity.notFound().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<List<PayrollResponse>> byPeriod(@RequestParam String period) {
        List<PayrollResponse> list = payrollRepository.findByPeriod(period).stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private PayrollResponse toResponse(Payroll p) {
        return PayrollResponse.builder()
                .id(p.getId())
                .employeeId(p.getEmployeeId())
                .period(p.getPeriod())
                .baseSalary(p.getBaseSalary())
                .bonuses(p.getBonuses())
                .deductions(p.getDeductions())
                .netSalary(p.getNetSalary())
                .processedDate(p.getProcessedDate())
                .build();
    }
}

