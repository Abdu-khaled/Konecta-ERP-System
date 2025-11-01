package finance_service.finance_service.dto.response;

import finance_service.finance_service.model.ExpenseStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private Long submittedBy;
    private String category;
    private Double amount;
    private String description;
    private ExpenseStatus status;
    private Long approvedBy;
    private LocalDateTime createdAt;
}

