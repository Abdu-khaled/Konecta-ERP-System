package inventory_service.inventory_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockLevelResponse {
    private Long itemId;
    private Long warehouseId; // may be null for all
    private Double quantity;
}

