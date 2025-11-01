package finance_service.finance_service.dto.request;

import lombok.Data;

@Data
public class PayrollRequest {
    private Long employeeId;
    // YYYY-MM
    private String period;
    private Double bonuses = 0.0;
    private Double deductions = 0.0;
    // Optional; if null, service will attempt to fetch from HR service
    private Double baseSalary;
}

