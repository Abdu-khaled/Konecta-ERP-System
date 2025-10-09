package auth_service.dto;

import auth_service.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
}
