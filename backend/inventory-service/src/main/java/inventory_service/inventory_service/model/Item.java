package inventory_service.inventory_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private String unit; // e.g., pcs, kg
    private Double reorderLevel; // threshold for low stock notifications
    private Instant createdAt;
}
