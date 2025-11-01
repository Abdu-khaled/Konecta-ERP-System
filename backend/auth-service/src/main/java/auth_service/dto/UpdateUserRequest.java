package auth_service.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Size(max = 120)
    private String fullName;

    @Size(max = 40)
    private String phone;
}

