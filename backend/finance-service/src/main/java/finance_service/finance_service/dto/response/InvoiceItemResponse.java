package finance_service.finance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemResponse {
    private Long id;
    private String product;
    private String account;
    private LocalDate dueDate;
    private Double quantity;
    private Double price;
    private Double discountPercent;
    private Double taxPercent;
    private Double whPercent;
    private Double baseAmount;
    private Double taxAmount;
    private Double withholding;
    private Double lineTotal;
}

