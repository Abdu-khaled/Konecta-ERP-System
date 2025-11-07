package finance_service.finance_service.service;

import finance_service.finance_service.model.Invoice;
import finance_service.finance_service.model.InvoiceItem;
import finance_service.finance_service.model.InvoiceStatus;
import finance_service.finance_service.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public Invoice create(Invoice i) {
        i.setStatus(InvoiceStatus.DRAFT);
        i.setCreatedAt(LocalDateTime.now());
        recalcTotals(i);
        return invoiceRepository.save(i);
    }

    public Invoice send(Long id) {
        Invoice i = invoiceRepository.findById(id).orElseThrow();
        i.setStatus(InvoiceStatus.SENT);
        return invoiceRepository.save(i);
    }

    public Invoice markPaid(Long id) {
        Invoice i = invoiceRepository.findById(id).orElseThrow();
        i.setStatus(InvoiceStatus.PAID);
        return invoiceRepository.save(i);
    }

    public List<Invoice> byStatus(InvoiceStatus status) {
        return invoiceRepository.findByStatus(status);
    }

    public List<Invoice> listAll() {
        return invoiceRepository.findAll();
    }

    public Invoice findById(Long id) { return invoiceRepository.findById(id).orElseThrow(); }

    public Invoice update(Long id, Invoice updated) {
        Invoice existing = invoiceRepository.findById(id).orElseThrow();
        existing.setClientName(updated.getClientName());
        existing.setInvoiceDate(updated.getInvoiceDate());
        // replace items
        existing.getItems().clear();
        if (updated.getItems() != null) {
            for (InvoiceItem it : updated.getItems()) {
                it.setInvoice(existing);
                existing.getItems().add(it);
            }
        }
        recalcTotals(existing);
        return invoiceRepository.save(existing);
    }

    private void recalcTotals(Invoice inv) {
        double untaxed = 0, tax = 0, wh = 0, total = 0;
        if (inv.getItems() != null) {
            for (InvoiceItem it : inv.getItems()) {
                double qty = nz(it.getQuantity());
                double price = nz(it.getPrice());
                double disc = nz(it.getDiscountPercent());
                double t = nz(it.getTaxPercent());
                double w = nz(it.getWhPercent());
                double base = qty * price * (1 - disc / 100.0);
                double taxAmt = base * (t / 100.0);
                // WH is a percentage of the tax (not of the base)
                double whAmt = taxAmt * (w / 100.0);
                double line = base + taxAmt - whAmt;
                it.setBaseAmount(base);
                it.setTaxAmount(taxAmt);
                it.setWithholding(whAmt);
                it.setLineTotal(line);
                untaxed += base; tax += taxAmt; wh += whAmt; total += line;
            }
        }
        inv.setUntaxedTotal(untaxed);
        inv.setTaxTotal(tax);
        inv.setWithholdingTotal(wh);
        inv.setGrandTotal(total);
        inv.setAmount(total); // keep mirrored
    }

    private double nz(Double v) { return v != null ? v : 0.0; }
}
