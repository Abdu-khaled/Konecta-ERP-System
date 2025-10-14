package auth_service.dto;

import auth_service.model.Role;

public class UpdateRoleRequest {
    private Role role;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}

