package inventory_service.inventory_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LowStockResponse {
    private Long itemId;
    private String sku;
    private String name;
    private Double quantity;
    private Double reorderLevel;
}

