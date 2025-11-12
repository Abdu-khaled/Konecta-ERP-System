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
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final PayrollRepository payrollRepository;
    private final RestTemplateBuilder restTemplateBuilder;
    private final finance_service.finance_service.repository.AccountRepository accountRepository;
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
                    if (resp != null && resp.getStatusCode().is2xxSuccessful()) {
                        java.util.Map body = resp.getBody();
                        if (body != null) {
                            Object val = body.get("email");
                            if (val != null) return val.toString();
                        }
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

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<List<finance_service.finance_service.dto.response.PayrollOverviewRow>> overview(@RequestParam String period, jakarta.servlet.http.HttpServletRequest request) {
        try {
            // 1) Fetch employees from HR
            var rt = restTemplateBuilder.build();
            java.util.List<?> employees = null;
            // Try service DNS first then localhost (dev)
            String[] candidates = new String[]{
                    "http://hr-service:8082/api/hr/employees",
                    "http://localhost:8088/api/hr/employees"
            };
            for (String url : candidates) {
                try {
                    HttpHeaders headers = new HttpHeaders();
                    String bearer = request.getHeader(org.springframework.http.HttpHeaders.AUTHORIZATION);
                    if (bearer != null) headers.set(org.springframework.http.HttpHeaders.AUTHORIZATION, bearer);
                    HttpEntity<Void> entity = new HttpEntity<>(headers);
                    var resp = rt.exchange(url, HttpMethod.GET, entity, java.util.List.class);
                    if (resp.getStatusCode().is2xxSuccessful()) { employees = resp.getBody(); break; }
                } catch (Exception ignored) { }
            }
            if (employees == null) employees = java.util.List.of();

            // 2) Build map of existing payroll by employee for the period
            Map<Long, Payroll> byEmp = payrollRepository.findByPeriod(period).stream()
                    .collect(Collectors.toMap(Payroll::getEmployeeId, x -> x, (a, b) -> a));

            // 2b) Fetch accounts by employee emails (if provided)
            java.util.Map<String, finance_service.finance_service.model.Account> accountsByEmail = new java.util.HashMap<>();
            try {
                java.util.List<String> emails = new java.util.ArrayList<>();
                for (Object o : employees) {
                    if (o instanceof Map<?,?> m) {
                        Object email = m.get("email");
                        if (email != null) emails.add(email.toString());
                    }
                }
                if (!emails.isEmpty()) {
                    for (var a : accountRepository.findByEmailInIgnoreCase(emails)) {
                        if (a.getEmail() != null) accountsByEmail.put(a.getEmail().toLowerCase(), a);
                    }
                }
            } catch (Exception ignored) {}

            // 3) Merge to overview rows
            List<finance_service.finance_service.dto.response.PayrollOverviewRow> rows = employees.stream().map(o -> {
                Long id = null; String first = ""; String last = ""; Double sal = 0.0;
                String email = null;
                if (o instanceof Map<?,?> m) {
                    Object idVal = m.get("id"); if (idVal != null) try { id = Long.valueOf(idVal.toString()); } catch (Exception ignored) {}
                    Object f = m.get("firstName"); if (f != null) first = f.toString();
                    Object l = m.get("lastName"); if (l != null) last = l.toString();
                    Object s = m.get("salary"); if (s != null) try { sal = Double.valueOf(s.toString()); } catch (Exception ignored) {}
                    Object e = m.get("email"); if (e != null) email = e.toString();
                }
                if (id == null) id = -1L;
                Payroll p = byEmp.get(id);
                double base = p != null && p.getBaseSalary() != null ? p.getBaseSalary() : (sal != null ? sal : 0.0);
                double bonuses = p != null && p.getBonuses() != null ? p.getBonuses() : 0.0;
                double deductions = p != null && p.getDeductions() != null ? p.getDeductions() : 0.0;
                double net = base + bonuses - deductions;
                String accountMasked = null; String cardType = null;
                if (email != null) {
                    var a = accountsByEmail.get(email.toLowerCase());
                    if (a != null) {
                        String acc = a.getAccountNumber();
                        if (acc != null && acc.length() >= 4) {
                            String last4 = acc.substring(acc.length()-4);
                            accountMasked = "**** **** **** " + last4;
                        } else {
                            accountMasked = acc;
                        }
                        cardType = a.getCardType() != null ? a.getCardType().name() : null;
                    }
                }
                return finance_service.finance_service.dto.response.PayrollOverviewRow.builder()
                        .employeeId(id)
                        .name((first + " " + last).trim())
                        .base(base)
                        .bonuses(bonuses)
                        .deductions(deductions)
                        .net(net)
                        .paid(p != null)
                        .accountMasked(accountMasked)
                        .cardType(cardType)
                        .build();
            }).collect(Collectors.toList());

            return ResponseEntity.ok(rows);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
