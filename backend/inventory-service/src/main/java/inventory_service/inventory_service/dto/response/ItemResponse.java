package inventory_service.inventory_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ItemResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private String unit;
    private Double reorderLevel;
}

