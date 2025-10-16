package hr_service.hr_service.controller;

import hr_service.hr_service.dto.request.PerformanceRequest;
import hr_service.hr_service.dto.response.PerformanceResponse;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.model.Performance;
import hr_service.hr_service.service.EmployeeService;
import hr_service.hr_service.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;
    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<PerformanceResponse> create(@RequestBody PerformanceRequest req) {
        Employee e = employeeService.findById(req.getEmployeeId());
        Performance p = Performance.builder()
                .employee(e)
                .rating(req.getRating())
                .feedback(req.getFeedback())
                .reviewDate(req.getReviewDate())
                .build();
        return ResponseEntity.ok(toResponse(performanceService.create(p)));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<PerformanceResponse>> byEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(
                performanceService.getByEmployee(employeeId).stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    private PerformanceResponse toResponse(Performance p) {
        return PerformanceResponse.builder()
                .id(p.getId())
                .employeeId(p.getEmployee() != null ? p.getEmployee().getId() : null)
                .rating(p.getRating())
                .feedback(p.getFeedback())
                .reviewDate(p.getReviewDate())
                .build();
    }
}
