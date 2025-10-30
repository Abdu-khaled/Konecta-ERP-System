package hr_service.hr_service.dto.request;

import lombok.Data;

@Data
public class EnsureEmployeeRequest {
    private String email;
    private String fullName;
    private String phone;
    private String position;
    private Long departmentId;
}

