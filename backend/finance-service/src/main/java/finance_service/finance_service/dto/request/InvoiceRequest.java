package finance_service.finance_service.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceRequest {
    private String clientName;
    private LocalDate invoiceDate;
    // optional legacy field; ignored if items are present
    private Double amount;

    private List<InvoiceItemRequest> items;
}

// moved InvoiceItemRequest to its own file for public access
