package finance_service.finance_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "accounts", indexes = {
        @Index(name = "idx_accounts_email", columnList = "email"),
        @Index(name = "idx_accounts_username", columnList = "username")
})
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long userId; // auth-service user id

    @Column(length = 255)
    private String username; // auth username (email or provided)

    @Column(length = 255)
    private String email; // for joining with HR employee

    @Column(nullable = false, length = 64)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CardType cardType;

    @Column
    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (active == null) active = Boolean.TRUE;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

