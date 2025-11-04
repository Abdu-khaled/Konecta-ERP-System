package hr_service.hr_service.controller;

import hr_service.hr_service.dto.request.LeaveRequestDTO;
import hr_service.hr_service.dto.response.LeaveResponse;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.model.LeaveRequest;
import hr_service.hr_service.model.LeaveStatus;
import hr_service.hr_service.service.EmployeeService;
import hr_service.hr_service.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;
    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveResponse> create(@RequestBody LeaveRequestDTO req) {
        // Employees can only create leave for themselves: resolve employee by token subject
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        Employee e = employeeService.findByEmail(username);
        if (e == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@')) : (username != null ? username : "");
            e = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        LeaveRequest r = LeaveRequest.builder()
                .employee(e)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .reason(req.getReason())
                .status(LeaveStatus.PENDING)
                .build();
        return ResponseEntity.ok(toResponse(leaveService.create(r)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<LeaveResponse>> listAll() {
        return ResponseEntity.ok(
                leaveService.listAll().stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<List<LeaveResponse>> byEmployee(@PathVariable Long employeeId) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_EMPLOYEE".equals(a.getAuthority()))) {
            String username = auth.getName();
            Employee self = employeeService.findByEmail(username);
            if (self == null) {
                String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@')) : (username != null ? username : "");
                self = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
            }
            employeeId = self.getId();
        }
        return ResponseEntity.ok(
                leaveService.getByEmployee(employeeId).stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<LeaveResponse>> mine() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        Employee self = employeeService.findByEmail(username);
        if (self == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@')) : (username != null ? username : "");
            self = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        Long employeeId = self.getId();
        return ResponseEntity.ok(
                leaveService.getByEmployee(employeeId).stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(leaveService.approve(id)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(leaveService.reject(id)));
    }

    private LeaveResponse toResponse(LeaveRequest r) {
        return LeaveResponse.builder()
                .id(r.getId())
                .employeeId(r.getEmployee() != null ? r.getEmployee().getId() : null)
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .reason(r.getReason())
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .build();
    }
}
