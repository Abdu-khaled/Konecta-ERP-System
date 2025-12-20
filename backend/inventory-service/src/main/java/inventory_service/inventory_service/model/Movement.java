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
public class Movement {
    private Long id;
    private Item item;
    private Warehouse warehouse;
    private MovementType type;
    private Double quantity;
    private String reference; // e.g., PO number, SO number
    private Instant createdAt;
}
