package finance_service.finance_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "expenses", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"department", "category", "expense_date"})
})
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nullable for imported departmental expenses
    private Long submittedBy; // employeeId

    private String category;
    private Double amount;
    private String description;

    @Enumerated(EnumType.STRING)
    private ExpenseStatus status;

    private Long approvedBy; // userId (admin/finance)

    private LocalDateTime createdAt;

    // New fields for imported departmental monthly expenses
    private String department;

    @Column(name = "expense_date")
    private LocalDate expenseDate; // the month/day of the expense (usually 1st of month)

    @Enumerated(EnumType.STRING)
    private ExpenseSource source; // USER or IMPORT

    @Column(length = 200)
    private String externalRef; // idempotency key (e.g., Finance|Audit Fees|2025-10)
}
