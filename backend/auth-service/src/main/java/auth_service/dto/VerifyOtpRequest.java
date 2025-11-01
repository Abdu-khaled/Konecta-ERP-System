package auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank
    private String token;

    @NotBlank
    @Pattern(regexp = "^\\d{4,8}$", message = "OTP must be 4-8 digits")
    private String otp;
}

