package hr_service.hr_service.controller;

import hr_service.hr_service.dto.request.TrainingRequest;
import hr_service.hr_service.dto.response.TrainingResponse;
import hr_service.hr_service.dto.response.TrainingEnrollmentResponse;
import hr_service.hr_service.model.Training;
import hr_service.hr_service.model.TrainingEnrollment;
import hr_service.hr_service.service.TrainingCertificateService;
import hr_service.hr_service.service.CertificateEmailService;
import hr_service.hr_service.service.TrainingService;
import hr_service.hr_service.service.EmployeeService;
import hr_service.hr_service.service.TrainingEnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/training")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;
    private final TrainingEnrollmentService enrollmentService;
    private final EmployeeService employeeService;
    private final TrainingCertificateService certificateService;
    private final java.util.Optional<CertificateEmailService> certificateEmailService;

    @GetMapping
    public ResponseEntity<List<TrainingResponse>> list() {
        var list = trainingService.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(trainingService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<TrainingResponse> create(@RequestBody TrainingRequest req) {
        var saved = trainingService.save(fromRequest(req));
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<TrainingResponse> update(@PathVariable Long id, @RequestBody TrainingRequest req) {
        var existing = trainingService.findById(id);
        existing.setTitle(req.getTitle());
        existing.setDescription(req.getDescription());
        existing.setStartDate(req.getStartDate());
        existing.setEndDate(req.getEndDate());
        existing.setInstructor(req.getInstructor());
        existing.setLocation(req.getLocation());
        var saved = trainingService.save(existing);
        return ResponseEntity.ok(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) { trainingService.delete(id); return ResponseEntity.noContent().build(); }

    // --- Employee enrollment endpoints ---
    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TrainingResponse> enroll(@PathVariable Long id) {
        var auth = currentAuthentication();
        String username = auth != null ? auth.getName() : null;
        var employee = employeeService.findByEmail(username);
        if (employee == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@')) : (username != null ? username : "");
            employee = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        var training = trainingService.findById(id);
        var enr = enrollmentService.enroll(employee, training);
        return ResponseEntity.ok(toEnrollmentResponse(enr.getId(), employee.getId(), training.getId()));
    }

    @GetMapping("/my-enrollments")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<TrainingResponse>> myEnrollments() {
        var auth = currentAuthentication();
        String username = auth != null ? auth.getName() : null;
        var emp = employeeService.findByEmail(username);
        if (emp == null) {
            String first = username != null && username.contains("@") ? username.substring(0, username.indexOf('@')) : (username != null ? username : "");
            emp = employeeService.ensureByEmail(username, first, "", null, null, null, null, null);
        }
        final var employeeId = emp.getId();
        var list = enrollmentService.findByEmployee(emp).stream()
                .map(en -> toEnrollmentResponse(en.getId(), employeeId, en.getTraining().getId()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // --- HR/Admin: list enrollments for a program ---
    @GetMapping("/{id}/enrollments")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<TrainingEnrollmentResponse>> listEnrollments(@PathVariable Long id) {
        var program = trainingService.findById(id);
        var list = enrollmentService.findByTraining(program).stream()
                .map(en -> TrainingEnrollmentResponse.builder()
                        .id(en.getId())
                        .programId(program.getId())
                        .programTitle(program.getTitle())
                        .employeeId(en.getEmployee() != null ? en.getEmployee().getId() : null)
                        .employeeName(en.getEmployee() != null ? ((en.getEmployee().getFirstName() != null ? en.getEmployee().getFirstName() : "") +
                                (en.getEmployee().getLastName() != null ? (" " + en.getEmployee().getLastName()) : "")).trim() : null)
                        .employeeEmail(en.getEmployee() != null ? en.getEmployee().getEmail() : null)
                        .status(en.getStatus())
                        .enrolledAt(en.getEnrolledAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/enrollments/{enrollmentId}/certificate")
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Long enrollmentId) {
        var enrollment = enrollmentService.findById(enrollmentId);
        var auth = currentAuthentication();
        if (!canAccessEnrollment(auth, enrollment)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        byte[] pdf = certificateService.generateCertificate(enrollment);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("certificate-" + enrollment.getId() + ".pdf")
                .build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @PostMapping("/enrollments/{enrollmentId}/certificate-email")
    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE')")
    public ResponseEntity<Void> emailCertificate(@PathVariable Long enrollmentId) {
        if (certificateEmailService.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
        }
        var enrollment = enrollmentService.findById(enrollmentId);
        var auth = currentAuthentication();
        if (!canAccessEnrollment(auth, enrollment)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (enrollment.getEmployee() == null || enrollment.getEmployee().getEmail() == null) {
            return ResponseEntity.badRequest().build();
        }
        byte[] pdf = certificateService.generateCertificate(enrollment);
        String to = enrollment.getEmployee().getEmail();
        String employeeName = (enrollment.getEmployee().getFirstName() != null ? enrollment.getEmployee().getFirstName() : "") +
                (enrollment.getEmployee().getLastName() != null ? (" " + enrollment.getEmployee().getLastName()) : "");
        String subject = "Your Training Certificate";
        String text = "Hello " + (employeeName.isBlank() ? "there" : employeeName.trim()) + ",\n\n" +
                "Attached is your certificate of completion.\n\nRegards,\nKonecta HR";
        String filename = "certificate-" + enrollment.getId() + ".pdf";
        certificateEmailService.get().sendCertificate(to, subject, text, pdf, filename);
        return ResponseEntity.noContent().build();
    }

    private Training fromRequest(TrainingRequest r) {
        return Training.builder()
                .title(r.getTitle())
                .description(r.getDescription())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .instructor(r.getInstructor())
                .location(r.getLocation())
                .build();
    }

    private TrainingResponse toResponse(Training t) {
        return TrainingResponse.builder()
                .id(t.getId())
                .type("PROGRAM")
                .title(t.getTitle())
                .description(t.getDescription())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .instructor(t.getInstructor())
                .location(t.getLocation())
                .build();
    }

    private TrainingResponse toEnrollmentResponse(Long enrollmentId, Long employeeId, Long programId) {
        return TrainingResponse.builder()
                .id(enrollmentId)
                .type("NOMINATION")
                .employeeId(employeeId)
                .programId(programId)
                .build();
    }

    private Authentication currentAuthentication() {
        return org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
    }

    private boolean canAccessEnrollment(Authentication auth, TrainingEnrollment enrollment) {
        if (hasRole(auth, "ADMIN") || hasRole(auth, "HR")) {
            return true;
        }
        if (auth == null || enrollment.getEmployee() == null) return false;
        String username = auth.getName();
        String employeeEmail = enrollment.getEmployee().getEmail();
        return username != null && employeeEmail != null && employeeEmail.equalsIgnoreCase(username);
    }

    private boolean hasRole(Authentication auth, String role) {
        if (auth == null) return false;
        String normalized = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return auth.getAuthorities().stream().anyMatch(granted -> normalized.equalsIgnoreCase(granted.getAuthority()));
    }
}
