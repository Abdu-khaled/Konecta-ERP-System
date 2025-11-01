package finance_service.finance_service.service;

import finance_service.finance_service.model.Invoice;
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
}
