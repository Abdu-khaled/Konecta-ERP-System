package finance_service.finance_service.dto.response;

import finance_service.finance_service.model.InvoiceStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class InvoiceResponse {
    private Long id;
    private String clientName;
    private LocalDate invoiceDate;
    private Double amount;
    private InvoiceStatus status;
    private LocalDateTime createdAt;
}

