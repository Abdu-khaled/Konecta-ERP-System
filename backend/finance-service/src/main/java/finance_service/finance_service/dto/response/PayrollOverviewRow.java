package finance_service.finance_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PayrollOverviewRow {
    private Long employeeId;
    private String name;
    private Double base;
    private Double bonuses;
    private Double deductions;
    private Double net;
    private Boolean paid;
    private String accountMasked;
    private String cardType; // VISA | MASTERCARD
}
