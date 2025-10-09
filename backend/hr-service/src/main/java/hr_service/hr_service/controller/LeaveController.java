package hr_service.hr_service.controller;

import hr_service.hr_service.model.LeaveRequest;
import hr_service.hr_service.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveRequest> create(@RequestBody LeaveRequest request) {
        return ResponseEntity.ok(leaveService.create(request));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<LeaveRequest>> byEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getByEmployee(employeeId));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveRequest> approve(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.approve(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveRequest> reject(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.reject(id));
    }
}
