package hr_service.hr_service.controller;

import hr_service.hr_service.dto.request.AttendanceRequest;
import hr_service.hr_service.dto.response.AttendanceResponse;
import hr_service.hr_service.model.Attendance;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.service.AttendanceService;
import hr_service.hr_service.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final EmployeeService employeeService;
    private final Environment environment;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> mark(@RequestBody AttendanceRequest req) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        // For employees, always resolve employee by token subject (username/email); auto-create if missing
        String username = auth != null ? auth.getName() : null;
        Employee e = employeeService.findByEmail(username);
        if (e == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@')) : (username != null ? username : "");
            e = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        if (!isWithinOfficeRadius(req.getLatitude(), req.getLongitude())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not in the office");
        }
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
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponse>> byEmployee(@PathVariable Long employeeId) {

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_EMPLOYEE".equals(a.getAuthority()))) {
            // Employees can only view own attendance; resolve or create
            String username = auth.getName();
            Employee self = employeeService.findByEmail(username);
            if (self == null) {
                String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@')) : (username != null ? username : "");
                self = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
            }
            employeeId = self.getId();
        }
        return ResponseEntity.ok(attendanceService.getByEmployee(employeeId).stream().map(this::toResponse).collect(Collectors.toList()));


    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponse>> mine() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        Employee self = employeeService.findByEmail(username);
        if (self == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@')) : (username != null ? username : "");
            self = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        Long employeeId = self.getId();
        return ResponseEntity.ok(attendanceService.getByEmployee(employeeId).stream().map(this::toResponse).collect(Collectors.toList()));
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

    private boolean isWithinOfficeRadius(Double latitude, Double longitude) {
        String officeLatStr = environment.getProperty("app.attendance.office.latitude");
        String officeLonStr = environment.getProperty("app.attendance.office.longitude");
        String radiusStr = environment.getProperty("app.attendance.office.radius-meters");
        if (officeLatStr == null || officeLonStr == null || radiusStr == null) {
            // Geofencing disabled if office location is not configured
            return true;
        }
        if (latitude == null || longitude == null) {
            // When geofencing is enabled, location is required
            return false;
        }
        try {
            double officeLat = Double.parseDouble(officeLatStr);
            double officeLon = Double.parseDouble(officeLonStr);
            double radiusMeters = Double.parseDouble(radiusStr);
            double distance = distanceInMeters(latitude, longitude, officeLat, officeLon);
            return distance <= radiusMeters;
        } catch (NumberFormatException ex) {
            // If configuration is invalid, fail open
            return true;
        }
    }

    private double distanceInMeters(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371000.0; // Earth radius in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
