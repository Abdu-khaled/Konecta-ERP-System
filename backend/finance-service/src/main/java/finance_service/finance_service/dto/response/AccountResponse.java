package finance_service.finance_service.dto.response;

import finance_service.finance_service.model.CardType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AccountResponse {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String accountNumber; // stored value (consider masking at API layer for UI)
    private CardType cardType;
    private Boolean active;
}

