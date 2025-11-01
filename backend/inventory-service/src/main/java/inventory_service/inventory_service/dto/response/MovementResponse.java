package inventory_service.inventory_service.dto.response;

import inventory_service.inventory_service.model.MovementType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MovementResponse {
    private Long id;
    private Long itemId;
    private Long warehouseId;
    private MovementType type;
    private Double quantity;
    private String reference;
    private Instant createdAt;
}

