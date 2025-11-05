package auth_service.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateSelfRequest {
    @Size(min = 3, max = 50)
    private String username; // optional

    @Size(min = 6, max = 120)
    private String password; // optional

    @Size(min = 6, max = 120)
    private String confirmPassword; // required when password provided
}

