package inventory_service.inventory_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inv_warehouse")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 250)
    private String location;
}

