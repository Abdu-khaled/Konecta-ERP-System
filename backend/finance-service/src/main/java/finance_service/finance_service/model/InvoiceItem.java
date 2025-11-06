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
@Table(name = "invoice_items")
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    private String product;   // product / service name
    private String account;   // accounting account code/name
    private LocalDate dueDate; // per-line due date (optional)

    private Double quantity;
    private Double price;
    private Double discountPercent; // 0..100
    private Double taxPercent;      // e.g., 0, 5, 10, 14 etc.
    private Double whPercent;       // withholding: 0, 1, 3, 5

    // Calculated fields (denormalized for reporting)
    private Double baseAmount;      // quantity * price * (1 - disc%)
    private Double taxAmount;       // base * tax%
    private Double withholding;     // base * wh%
    private Double lineTotal;       // base + tax - withholding
}

