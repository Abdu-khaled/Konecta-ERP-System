package inventory_service.inventory_service.dto.request;

import lombok.Data;

@Data
public class ItemRequest {
    private String sku;
    private String name;
    private String description;
    private String unit;
    private Double reorderLevel;
    // Optional initial stock on create
    private Double initialQuantity;
    private Long warehouseId;
}
