package hr_service.hr_service.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequestDTO {
    private Long employeeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}

