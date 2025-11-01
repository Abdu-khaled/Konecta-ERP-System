package finance_service.finance_service.controller;

import finance_service.finance_service.dto.request.PayrollRequest;
import finance_service.finance_service.dto.response.PayrollResponse;
import finance_service.finance_service.model.Payroll;
import finance_service.finance_service.repository.PayrollRepository;
import finance_service.finance_service.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpServletRequest;
import finance_service.finance_service.security.JwtService;
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
    private final RestTemplateBuilder restTemplateBuilder;
    private final JwtService jwtService;

    @PostMapping("/calculate")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<PayrollResponse> calculate(@RequestBody PayrollRequest req) {
        Payroll saved = payrollService.calculateAndSave(req);
        return ResponseEntity.ok(toResponse(saved));
    }

    // Compatibility endpoint for existing frontend client that posts to /payroll
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<PayrollResponse> calculateCompat(@RequestBody PayrollRequest req) {
        Payroll saved = payrollService.calculateAndSave(req);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','EMPLOYEE')")
    public ResponseEntity<PayrollResponse> byEmployeeAndPeriod(@PathVariable Long employeeId, @RequestParam String period, HttpServletRequest request) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_EMPLOYEE".equals(a.getAuthority()))) {
            // Employees can only view their own payroll record
            Long selfId = resolveSelfEmployeeId(request);
            if (selfId == null || !selfId.equals(employeeId)) {
                return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
        }
        Payroll p = payrollService.getByEmployeeAndPeriod(employeeId, period);
        return p != null ? ResponseEntity.ok(toResponse(p)) : ResponseEntity.notFound().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<PayrollResponse> myPayroll(@RequestParam String period, HttpServletRequest request) {
        Long selfId = resolveSelfEmployeeId(request);
        if (selfId == null) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        Payroll p = payrollService.getByEmployeeAndPeriod(selfId, period);
        if (p == null) {
            // If record is missing and caller is EMPLOYEE, attempt an on-demand calculation using HR base salary
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean isEmployee = auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_EMPLOYEE".equals(a.getAuthority()));
            if (isEmployee) {
                finance_service.finance_service.dto.request.PayrollRequest req = new finance_service.finance_service.dto.request.PayrollRequest();
                req.setEmployeeId(selfId);
                req.setPeriod(period);
                // leave baseSalary null to trigger HR lookup; bonuses/deductions default to 0
                p = payrollService.calculateAndSave(req);
            }
        }
        return p != null ? ResponseEntity.ok(toResponse(p)) : ResponseEntity.notFound().build();
    }

    private Long resolveSelfEmployeeId(HttpServletRequest request) {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            String subject = auth != null ? auth.getName() : null;
            if (subject == null) return null;
            var rt = restTemplateBuilder.build();
            HttpHeaders headers = new HttpHeaders();
            String bearer = request.getHeader(org.springframework.http.HttpHeaders.AUTHORIZATION);
            if (bearer != null) headers.set(org.springframework.http.HttpHeaders.AUTHORIZATION, bearer);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            // Try to extract explicit username claim (might be the system username while subject is email)
            String usernameClaim = null;
            try {
                if (bearer != null && bearer.startsWith("Bearer ")) {
                    var jws = jwtService.validate(bearer.substring(7));
                    Object un = jws.getBody().get("username");
                    if (un != null) usernameClaim = un.toString();
                }
            } catch (Exception ignored) {}
            String[] candidates = new String[]{
                    "http://hr-service:8082",
                    "http://localhost:8088"
            };
            for (String base : candidates) {
                try {
                    // First, ask HR for my employee id directly
                    try {
                        var idResp = rt.exchange(base + "/api/hr/employees/me-id", HttpMethod.GET, entity, Long.class);
                        if (idResp.getStatusCode().is2xxSuccessful() && idResp.getBody() != null) {
                            return idResp.getBody();
                        }
                    } catch (Exception ignored) {}
                    // First attempt list employees
                    var resp = rt.exchange(base + "/api/hr/employees", HttpMethod.GET, entity, java.util.List.class);
                    if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() instanceof java.util.List<?> list) {
                        for (Object o : list) {
                            if (o instanceof java.util.Map<?, ?> m) {
                                Object email = m.get("email");
                                Object id = m.get("id");
                                if (email != null && id != null && (
                                        subject.equalsIgnoreCase(email.toString()) ||
                                        (usernameClaim != null && usernameClaim.equalsIgnoreCase(email.toString()))
                                )) {
                                    try { return Long.valueOf(id.toString()); } catch (Exception ignored) {}
                                }
                            }
                        }
                    }
                    // If not found, trigger HR to auto-create self record via attendance/me, then retry employees
                    try {
                        rt.exchange(base + "/api/hr/attendance/me", HttpMethod.GET, entity, java.util.List.class);
                    } catch (Exception ignored) {}
                    try {
                        var resp2 = rt.exchange(base + "/api/hr/employees", HttpMethod.GET, entity, java.util.List.class);
                        if (resp2.getStatusCode().is2xxSuccessful() && resp2.getBody() instanceof java.util.List<?> list2) {
                            for (Object o : list2) {
                                if (o instanceof java.util.Map<?, ?> m) {
                                    Object email = m.get("email");
                                    Object id = m.get("id");
                                    if (email != null && id != null && (
                                            subject.equalsIgnoreCase(email.toString()) ||
                                            (usernameClaim != null && usernameClaim.equalsIgnoreCase(email.toString()))
                                    )) {
                                        try { return Long.valueOf(id.toString()); } catch (Exception ignored) {}
                                    }
                                }
                            }
                        }
                    } catch (Exception ignored) {}
                } catch (Exception ignored) { }
            }
        } catch (Exception ignored) { }
        return null;
    }

    private String fetchEmployeeEmail(Long employeeId) {
        try {
            var rt = restTemplateBuilder.build();
            String[] candidates = new String[]{
                    "http://hr-service:8082/api/hr/employees/" + employeeId,
                    "http://localhost:8088/api/hr/employees/" + employeeId
            };
            for (String url : candidates) {
                try {
                    org.springframework.http.ResponseEntity<java.util.Map> resp = rt.getForEntity(url, java.util.Map.class);
                    if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null && resp.getBody().get("email") != null) {
                        Object val = resp.getBody().get("email");
                        return val != null ? val.toString() : null;
                    }
                } catch (Exception ignored) { }
            }
        } catch (Exception ignored) { }
        return null;
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
