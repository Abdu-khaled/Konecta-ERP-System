package finance_service.finance_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PayrollResponse {
    private Long id;
    private Long employeeId;
    private String period;
    private Double baseSalary;
    private Double bonuses;
    private Double deductions;
    private Double netSalary;
    private LocalDate processedDate;
}

