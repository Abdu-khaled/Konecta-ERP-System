package finance_service.finance_service.controller;

import finance_service.finance_service.dto.request.ExpenseRequest;
import finance_service.finance_service.dto.response.ExpenseResponse;
import finance_service.finance_service.model.Expense;
import finance_service.finance_service.model.ExpenseStatus;
import finance_service.finance_service.service.ExpenseService;
import finance_service.finance_service.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import finance_service.finance_service.dto.response.ImportSummary;
import finance_service.finance_service.service.ExpenseImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseImportService expenseImportService;
    private final JwtService jwtService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','EMPLOYEE')")
    public ResponseEntity<ExpenseResponse> submit(@RequestBody ExpenseRequest req) {
        Expense e = Expense.builder()
                .submittedBy(req.getSubmittedBy())
                .category(req.getCategory())
                .amount(req.getAmount())
                .description(req.getDescription())
                .build();
        return ResponseEntity.ok(toResponse(expenseService.submit(e)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<ExpenseResponse> approve(@PathVariable Long id, @RequestParam Long approverId) {
        return ResponseEntity.ok(toResponse(expenseService.approve(id, approverId)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<ExpenseResponse> reject(@PathVariable Long id, @RequestParam Long approverId) {
        return ResponseEntity.ok(toResponse(expenseService.reject(id, approverId)));
    }

    @GetMapping("/by-submitter/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','EMPLOYEE')")
    public ResponseEntity<List<ExpenseResponse>> bySubmitter(@PathVariable Long employeeId) {
        return ResponseEntity.ok(
                expenseService.bySubmitter(employeeId).stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<List<ExpenseResponse>> byStatus(@RequestParam(required = false) ExpenseStatus status) {
        List<Expense> list = (status == null)
                ? expenseService.listAll()
                : expenseService.byStatus(status);
        return ResponseEntity.ok(list.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','HR')")
    public ResponseEntity<ImportSummary> importExpenses(
            @RequestParam("file") MultipartFile file,
            @RequestParam(name = "status", required = false, defaultValue = "APPROVED") ExpenseStatus status,
            @RequestParam(name = "dateFormat", required = false, defaultValue = "M/d/yyyy") String dateFormat,
            @RequestParam(name = "mode", required = false, defaultValue = "upsert") String mode
    , @RequestHeader(value = "Authorization", required = false) String authHeader
    ) throws java.io.IOException {
        Long importerId = extractUserId(authHeader);
        ImportSummary result = expenseImportService.importExpenses(file, dateFormat, status, mode, importerId);
        return ResponseEntity.ok(result);
    }

    // Binary upload variant for environments where multipart is proxied incorrectly
    @PostMapping(value = "/import-bin", consumes = {"application/octet-stream", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','HR')")
    public ResponseEntity<ImportSummary> importExpensesBinary(
            @RequestHeader(value = "X-Filename", required = false) String filename,
            @RequestBody byte[] body,
            @RequestParam(name = "status", required = false, defaultValue = "APPROVED") ExpenseStatus status,
            @RequestParam(name = "dateFormat", required = false, defaultValue = "M/d/yyyy") String dateFormat,
            @RequestParam(name = "mode", required = false, defaultValue = "upsert") String mode
    , @RequestHeader(value = "Authorization", required = false) String authHeader
    ) throws java.io.IOException {
        Long importerId = extractUserId(authHeader);
        ImportSummary result = expenseImportService.importExpenses(body, filename == null ? "upload.csv" : filename, dateFormat, status, mode, importerId);
        return ResponseEntity.ok(result);
    }

    private Long extractUserId(String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                var jws = jwtService.validate(authHeader.substring(7));
                Object uid = jws.getBody().get("uid");
                if (uid instanceof Number) return ((Number) uid).longValue();
                if (uid != null) return Long.parseLong(uid.toString());
            }
        } catch (Exception ignored) {}
        return 0L; // fallback system user id
    }

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .submittedBy(e.getSubmittedBy())
                .category(e.getCategory())
                .amount(e.getAmount())
                .description(e.getDescription())
                .status(e.getStatus())
                .approvedBy(e.getApprovedBy())
                .createdAt(e.getCreatedAt())
                .department(e.getDepartment())
                .expenseDate(e.getExpenseDate())
                .build();
    }
}
