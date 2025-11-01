package finance_service.finance_service.controller;

import finance_service.finance_service.dto.request.ExpenseRequest;
import finance_service.finance_service.dto.response.ExpenseResponse;
import finance_service.finance_service.model.Expense;
import finance_service.finance_service.model.ExpenseStatus;
import finance_service.finance_service.service.ExpenseService;
import lombok.RequiredArgsConstructor;
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
                .build();
    }
}
