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
public class AttendanceResponse {
    private Long id;
    private Long employeeId;
    private LocalDate date;
    private Boolean present;
    private Double workingHours;
}

