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
public class EmployeeResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String position;
    private LocalDate hireDate;
    private Double salary;
    private Double workingHours;
    private Long departmentId;
    private String departmentName;
    // Enriched from Finance for HR view/sharing
    private String accountMasked;
    private String cardType; // e.g. VISA/MASTERCARD
}
