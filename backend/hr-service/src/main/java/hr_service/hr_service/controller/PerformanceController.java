package hr_service.hr_service.controller;

import hr_service.hr_service.model.Performance;
import hr_service.hr_service.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Performance> create(@RequestBody Performance p) {
        return ResponseEntity.ok(performanceService.create(p));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<Performance>> byEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(performanceService.getByEmployee(employeeId));
    }
}
