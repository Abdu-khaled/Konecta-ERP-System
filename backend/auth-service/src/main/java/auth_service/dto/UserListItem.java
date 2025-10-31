package auth_service.dto;

import auth_service.model.Role;
import auth_service.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserListItem {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private Boolean otpVerified;
    private LocalDateTime createdAt;
}
