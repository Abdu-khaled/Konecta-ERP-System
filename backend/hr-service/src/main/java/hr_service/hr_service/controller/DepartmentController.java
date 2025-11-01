package hr_service.hr_service.controller;

import hr_service.hr_service.dto.request.DepartmentRequest;
import hr_service.hr_service.dto.response.DepartmentResponse;
import hr_service.hr_service.model.Department;
import hr_service.hr_service.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getAll() {
        return ResponseEntity.ok(
                departmentService.findAll().stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(departmentService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<DepartmentResponse> create(@RequestBody DepartmentRequest req) {
        Department d = Department.builder().name(req.getName()).description(req.getDescription()).build();
        return ResponseEntity.ok(toResponse(departmentService.create(d)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<DepartmentResponse> update(@PathVariable Long id, @RequestBody DepartmentRequest req) {
        Department d = Department.builder().name(req.getName()).description(req.getDescription()).build();
        return ResponseEntity.ok(toResponse(departmentService.update(id, d)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        departmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private DepartmentResponse toResponse(Department d) {
        return DepartmentResponse.builder().id(d.getId()).name(d.getName()).description(d.getDescription()).build();
    }
}
