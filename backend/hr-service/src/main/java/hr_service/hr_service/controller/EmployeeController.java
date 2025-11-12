package hr_service.hr_service.controller;

import hr_service.hr_service.dto.request.EmployeeRequest;
import hr_service.hr_service.dto.request.EnsureEmployeeRequest;
import hr_service.hr_service.dto.response.EmployeeResponse;
import hr_service.hr_service.model.Department;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.messaging.ActivityEventPublisher;
import hr_service.hr_service.service.DepartmentService;
import hr_service.hr_service.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final DepartmentService departmentService;
    private final ActivityEventPublisher eventPublisher;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR','FINANCE')")
    public ResponseEntity<List<EmployeeResponse>> getAll() {
        List<EmployeeResponse> body = employeeService.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','FINANCE')")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(employeeService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponse> create(@RequestBody EmployeeRequest req) {
        Employee e = fromRequest(req);
        Employee saved = employeeService.create(e);
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String title = "Employee created";
        String summary = saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getEmail() + ")";
        eventPublisher.publish("created", "Employee", String.valueOf(saved.getId()), title, summary, "pushed", auth);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<EmployeeResponse> update(@PathVariable Long id, @RequestBody EmployeeRequest req) {
        Employee updated = fromRequest(req);
        Employee saved = employeeService.update(id, updated);
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String title = "Employee updated";
        String summary = saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getEmail() + ")";
        eventPublisher.publish("updated", "Employee", String.valueOf(saved.getId()), title, summary, "pushed", auth);
        return ResponseEntity.ok(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String title = "Employee deleted";
        String summary = "Employee ID " + id + " deleted";
        eventPublisher.publish("deleted", "Employee", String.valueOf(id), title, summary, "pushed", auth);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ensure")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<EmployeeResponse> ensure(@RequestBody EnsureEmployeeRequest req) {
        Department dept = null;
        if (req.getDepartmentId() != null) {
            dept = departmentService.findById(req.getDepartmentId());
        }
        String full = req.getFullName() != null ? req.getFullName().trim() : "";
        String first = full.contains(" ") ? full.substring(0, full.indexOf(' ')).trim() : full;
        String last = full.contains(" ") ? full.substring(full.indexOf(' ') + 1).trim() : "";
        Employee saved = employeeService.ensureByEmail(req.getEmail(), first, last, req.getPhone(), req.getPosition(), dept, req.getSalary(), req.getWorkingHours());
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String title = "Employee ensured";
        String summary = saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getEmail() + ")";
        eventPublisher.publish("ensured", "Employee", String.valueOf(saved.getId()), title, summary, "pushed", auth);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/me-id")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Long> myEmployeeId() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(403).build();
        }
        var existing = employeeService.findByEmail(username);
        if (existing == null) {
            String first = username.contains("@") ? username.substring(0, username.indexOf('@')) : username;
            existing = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        return ResponseEntity.ok(existing.getId());
    }

    private Employee fromRequest(EmployeeRequest r) {
        Department dept = null;
        if (r.getDepartmentId() != null) {
            dept = departmentService.findById(r.getDepartmentId());
        }
        return Employee.builder()
                .firstName(r.getFirstName())
                .lastName(r.getLastName())
                .email(r.getEmail())
                .phone(r.getPhone())
                .position(r.getPosition())
                .hireDate(r.getHireDate())
                .salary(r.getSalary())
                .workingHours(r.getWorkingHours())
                .department(dept)
                .build();
    }

    private EmployeeResponse toResponse(Employee e) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        boolean isFinance = auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_FINANCE".equals(a.getAuthority()));
        boolean isHr = auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_HR".equals(a.getAuthority()));
        return EmployeeResponse.builder()
                .id(e.getId())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .email((isAdmin || isFinance || isHr) ? e.getEmail() : null)
                .phone(isAdmin ? e.getPhone() : null)
                .position(e.getPosition())
                .hireDate(e.getHireDate())
                .salary((isAdmin || isFinance || isHr) ? e.getSalary() : null)
                .workingHours(e.getWorkingHours())
                .departmentId(e.getDepartment() != null ? e.getDepartment().getId() : null)
                .departmentName(e.getDepartment() != null ? e.getDepartment().getName() : null)
                .build();
    }
}
