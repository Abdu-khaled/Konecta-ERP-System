package finance_service.finance_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payroll")
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    // Format: YYYY-MM
    @Column(nullable = false)
    private String period;

    private Double baseSalary;
    private Double bonuses;
    private Double deductions;
    private Double netSalary;

    private LocalDate processedDate;
}

