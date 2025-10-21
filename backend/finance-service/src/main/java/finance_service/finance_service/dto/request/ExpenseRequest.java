package finance_service.finance_service.dto.request;

import lombok.Data;

@Data
public class ExpenseRequest {
    private Long submittedBy; // employeeId
    private String category;
    private Double amount;
    private String description;
}

