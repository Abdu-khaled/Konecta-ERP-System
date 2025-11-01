package finance_service.finance_service.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InvoiceRequest {
    private String clientName;
    private LocalDate invoiceDate;
    private Double amount;
}

