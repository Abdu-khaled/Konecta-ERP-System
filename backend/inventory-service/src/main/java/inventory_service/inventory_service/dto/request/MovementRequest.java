package inventory_service.inventory_service.dto.request;

import inventory_service.inventory_service.model.MovementType;
import lombok.Data;

@Data
public class MovementRequest {
    private Long itemId;
    private Long warehouseId;
    private MovementType type; // IN, OUT, ADJUST
    private Double quantity;
    private String reference;
}

