package hr_service.hr_service.controller;

import hr_service.hr_service.model.Attendance;
import hr_service.hr_service.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Attendance> mark(@RequestBody Attendance attendance) {
        return ResponseEntity.ok(attendanceService.markAttendance(attendance));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<Attendance>> byEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.getByEmployee(employeeId));
    }
}
