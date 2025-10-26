package auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompleteRegistrationRequest {
    @NotBlank
    private String token;

    @NotBlank
    private String fullName;

    private String phone;

    // Optional custom username; if null, keep existing
    private String username;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;
}

