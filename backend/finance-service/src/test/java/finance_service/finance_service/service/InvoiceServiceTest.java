package finance_service.finance_service.service;

import finance_service.finance_service.model.Invoice;
import finance_service.finance_service.model.InvoiceStatus;
import finance_service.finance_service.repository.InvoiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private InvoiceService invoiceService;

    @Test
    void create_setsDraftAndTimestamp() {
        given(invoiceRepository.save(any(Invoice.class))).willAnswer(inv -> inv.getArgument(0));
        Invoice i = Invoice.builder().clientName("ACME").invoiceDate(LocalDate.now()).amount(100.0).build();
        Invoice saved = invoiceService.create(i);
        assertThat(saved.getStatus()).isEqualTo(InvoiceStatus.DRAFT);
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void send_movesToSent() {
        Invoice i = new Invoice();
        i.setId(5L);
        when(invoiceRepository.findById(5L)).thenReturn(Optional.of(i));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));
        Invoice saved = invoiceService.send(5L);
        assertThat(saved.getStatus()).isEqualTo(InvoiceStatus.SENT);
    }

    @Test
    void markPaid_movesToPaid() {
        Invoice i = new Invoice();
        i.setId(6L);
        when(invoiceRepository.findById(6L)).thenReturn(Optional.of(i));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));
        Invoice saved = invoiceService.markPaid(6L);
        assertThat(saved.getStatus()).isEqualTo(InvoiceStatus.PAID);
    }
}
