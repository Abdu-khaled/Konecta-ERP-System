package hr_service.hr_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceResponse {
    private Long id;
    private Long employeeId;
    private Integer rating;
    private String feedback;
    private LocalDate reviewDate;
}

