package finance_service.finance_service.controller;

import finance_service.finance_service.dto.request.InvoiceRequest;
import finance_service.finance_service.dto.response.InvoiceResponse;
import finance_service.finance_service.model.Invoice;
import finance_service.finance_service.model.InvoiceStatus;
import finance_service.finance_service.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<InvoiceResponse> create(@RequestBody InvoiceRequest req) {
        Invoice i = Invoice.builder()
                .clientName(req.getClientName())
                .invoiceDate(req.getInvoiceDate())
                .amount(req.getAmount())
                .build();
        return ResponseEntity.ok(toResponse(invoiceService.create(i)));
    }

    @PutMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<InvoiceResponse> send(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(invoiceService.send(id)));
    }

    @PutMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<InvoiceResponse> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(invoiceService.markPaid(id)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<List<InvoiceResponse>> byStatus(@RequestParam(required = false) InvoiceStatus status) {
        InvoiceStatus s = status != null ? status : InvoiceStatus.DRAFT;
        List<InvoiceResponse> body = invoiceService.byStatus(s).stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }

    private InvoiceResponse toResponse(Invoice i) {
        return InvoiceResponse.builder()
                .id(i.getId())
                .clientName(i.getClientName())
                .invoiceDate(i.getInvoiceDate())
                .amount(i.getAmount())
                .status(i.getStatus())
                .createdAt(i.getCreatedAt())
                .build();
    }
}

