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
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveResponse> create(@RequestBody LeaveRequestDTO req) {
        Employee e = employeeService.findById(req.getEmployeeId());
        LeaveRequest r = LeaveRequest.builder()
                .employee(e)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .reason(req.getReason())
                .status(LeaveStatus.PENDING)
                .build();
        return ResponseEntity.ok(toResponse(leaveService.create(r)));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<LeaveResponse>> byEmployee(@PathVariable Long employeeId) {
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
