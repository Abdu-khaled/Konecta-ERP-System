package finance_service.finance_service.dto.request;

import finance_service.finance_service.model.CardType;
import lombok.Data;

@Data
public class EnsureAccountRequest {
    private Long userId; // auth user id
    private String username;
    private String email;
    private String accountNumber;
    private CardType cardType; // VISA | MASTERCARD
}

