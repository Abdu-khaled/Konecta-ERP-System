package hr_service.hr_service.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceRequest {
    private Long employeeId;
    private LocalDate date;
    private Boolean present;
    private Double workingHours;
}
