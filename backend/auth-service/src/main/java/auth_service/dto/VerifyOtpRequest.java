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

    // Optional account fields collected on verification page
    private String accountNumber; // digits only or with spaces
    private String cardType; // VISA or MASTERCARD
}
