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
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long submittedBy; // employeeId

    private String category;
    private Double amount;
    private String description;

    @Enumerated(EnumType.STRING)
    private ExpenseStatus status;

    private Long approvedBy; // userId (admin/finance)

    private LocalDateTime createdAt;
}

