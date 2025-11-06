package finance_service.finance_service.dto.response;

import finance_service.finance_service.model.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {
    private Long id;
    private String clientName;
    private LocalDate invoiceDate;
    private Double amount;      // mirrors grandTotal
    private InvoiceStatus status;
    private LocalDateTime createdAt;

    private List<InvoiceItemResponse> items;
    private Double untaxedTotal;
    private Double taxTotal;
    private Double withholdingTotal;
    private Double grandTotal;
    private boolean pdfAttached;
}
