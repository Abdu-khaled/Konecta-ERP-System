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
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientName;
    private LocalDate invoiceDate;
    // legacy single-amount (kept for compatibility); will mirror grandTotal
    private Double amount;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    private LocalDateTime createdAt;

    // Item lines
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<InvoiceItem> items = new java.util.ArrayList<>();

    // Totals (calculated)
    private Double untaxedTotal;      // sum of (qty*price*(1 - disc%))
    private Double taxTotal;          // sum of tax amount for each line
    private Double withholdingTotal;  // sum of withholding for each line
    private Double grandTotal;        // untaxedTotal + taxTotal - withholdingTotal

    // Optional attached PDF
    private String pdfFileName;
    private String pdfContentType;
    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] pdfData;
}
