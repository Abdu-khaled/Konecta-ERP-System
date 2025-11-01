package finance_service.finance_service.repository;

import finance_service.finance_service.model.Invoice;
import finance_service.finance_service.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByStatus(InvoiceStatus status);
}

