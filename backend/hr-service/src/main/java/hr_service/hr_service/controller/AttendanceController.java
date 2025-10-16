package hr_service.hr_service.controller;

import hr_service.hr_service.dto.request.AttendanceRequest;
import hr_service.hr_service.dto.response.AttendanceResponse;
import hr_service.hr_service.model.Attendance;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.service.AttendanceService;
import hr_service.hr_service.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<AttendanceResponse> mark(@RequestBody AttendanceRequest req) {
        Employee e = employeeService.findById(req.getEmployeeId());
        Attendance a = Attendance.builder()
                .employee(e)
                .date(req.getDate())
                .present(req.getPresent())
                .workingHours(req.getWorkingHours())
                .build();
        Attendance saved = attendanceService.markAttendance(a);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<AttendanceResponse>> byEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(
                attendanceService.getByEmployee(employeeId).stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .employeeId(a.getEmployee() != null ? a.getEmployee().getId() : null)
                .date(a.getDate())
                .present(a.getPresent())
                .workingHours(a.getWorkingHours())
                .build();
    }
}
