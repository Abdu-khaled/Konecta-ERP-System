package hr_service.hr_service.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class OnboardingRequest {
    private Long employeeId;
    private LocalDate startDate;
}

