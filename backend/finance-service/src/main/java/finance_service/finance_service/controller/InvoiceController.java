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
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

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
        Invoice i = fromRequest(req);
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
        List<Invoice> list = (status == null)
                ? invoiceService.listAll()
                : invoiceService.byStatus(status);
        List<InvoiceResponse> body = list.stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<InvoiceResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(invoiceService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<InvoiceResponse> update(@PathVariable Long id, @RequestBody InvoiceRequest req) {
        Invoice updated = fromRequest(req);
        return ResponseEntity.ok(toResponse(invoiceService.update(id, updated)));
    }

    @PostMapping(value = "/{id}/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<Void> uploadPdf(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws java.io.IOException {
        Invoice inv = invoiceService.findById(id);
        inv.setPdfFileName(file.getOriginalFilename());
        inv.setPdfContentType(file.getContentType() == null ? "application/pdf" : file.getContentType());
        inv.setPdfData(file.getBytes());
        invoiceService.update(id, inv);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/{id}/pdf-bin", consumes = { MediaType.APPLICATION_OCTET_STREAM_VALUE, "application/pdf" })
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<Void> uploadPdfBinary(@PathVariable Long id, @RequestHeader(value = "X-Filename", required = false) String filename, @RequestBody byte[] body) {
        Invoice inv = invoiceService.findById(id);
        inv.setPdfFileName(filename == null ? "invoice.pdf" : filename);
        inv.setPdfContentType("application/pdf");
        inv.setPdfData(body);
        invoiceService.update(id, inv);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public @ResponseBody byte[] downloadPdf(@PathVariable Long id) {
        Invoice inv = invoiceService.findById(id);
        return inv.getPdfData() == null ? new byte[0] : inv.getPdfData();
    }

    private InvoiceResponse toResponse(Invoice i) {
        java.util.List<finance_service.finance_service.dto.response.InvoiceItemResponse> itemResponses = (i.getItems() == null)
                ? java.util.Collections.emptyList()
                : i.getItems().stream().map(it -> finance_service.finance_service.dto.response.InvoiceItemResponse.builder()
                .id(it.getId())
                .product(it.getProduct())
                .account(it.getAccount())
                .dueDate(it.getDueDate())
                .quantity(it.getQuantity())
                .price(it.getPrice())
                .discountPercent(it.getDiscountPercent())
                .taxPercent(it.getTaxPercent())
                .whPercent(it.getWhPercent())
                .baseAmount(it.getBaseAmount())
                .taxAmount(it.getTaxAmount())
                .withholding(it.getWithholding())
                .lineTotal(it.getLineTotal())
                .build()).collect(java.util.stream.Collectors.toList());
        return InvoiceResponse.builder()
                .id(i.getId())
                .clientName(i.getClientName())
                .invoiceDate(i.getInvoiceDate())
                .amount(i.getAmount())
                .status(i.getStatus())
                .createdAt(i.getCreatedAt())
                .untaxedTotal(i.getUntaxedTotal())
                .taxTotal(i.getTaxTotal())
                .withholdingTotal(i.getWithholdingTotal())
                .grandTotal(i.getGrandTotal())
                .pdfAttached(i.getPdfData() != null && i.getPdfData().length > 0)
                .items(itemResponses)
                .build();
    }

    private Invoice fromRequest(InvoiceRequest r) {
        Invoice i = Invoice.builder()
                .clientName(r.getClientName())
                .invoiceDate(r.getInvoiceDate())
                .amount(r.getAmount())
                .build();
        if (r.getItems() != null) {
            for (var itReq : r.getItems()) {
                var it = finance_service.finance_service.model.InvoiceItem.builder()
                        .product(itReq.getProduct())
                        .account(itReq.getAccount())
                        .dueDate(itReq.getDueDate())
                        .quantity(itReq.getQuantity())
                        .price(itReq.getPrice())
                        .discountPercent(itReq.getDiscountPercent())
                        .taxPercent(itReq.getTaxPercent())
                        .whPercent(itReq.getWhPercent())
                        .build();
                it.setInvoice(i);
                i.getItems().add(it);
            }
        }
        return i;
    }
}
