package finance_service.finance_service.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InvoiceItemRequest {
    private String product;
    private String account;
    private LocalDate dueDate;
    private Double quantity;
    private Double price;
    private Double discountPercent; // 0..100
    private Double taxPercent;      // e.g. VAT
    private Double whPercent;       // 0 | 1 | 3 | 5
}

