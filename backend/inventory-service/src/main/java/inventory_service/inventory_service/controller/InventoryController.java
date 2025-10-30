package inventory_service.inventory_service.controller;

import inventory_service.inventory_service.dto.request.MovementRequest;
import inventory_service.inventory_service.dto.response.LowStockResponse;
import inventory_service.inventory_service.dto.response.MovementResponse;
import inventory_service.inventory_service.dto.response.StockLevelResponse;
import inventory_service.inventory_service.model.Item;
import inventory_service.inventory_service.model.Movement;
import inventory_service.inventory_service.repository.ItemRepository;
import inventory_service.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final ItemRepository itemRepository;

    @PostMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<MovementResponse> movement(@RequestBody MovementRequest req) {
        Movement saved = inventoryService.recordMovement(req);
        return ResponseEntity.ok(MovementResponse.builder()
                .id(saved.getId())
                .itemId(saved.getItem().getId())
                .warehouseId(saved.getWarehouse().getId())
                .type(saved.getType())
                .quantity(saved.getQuantity())
                .reference(saved.getReference())
                .createdAt(saved.getCreatedAt())
                .build());
    }

    @GetMapping("/stock")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<StockLevelResponse> stock(@RequestParam Long itemId,
                                                    @RequestParam(required = false) Long warehouseId) {
        Double qty = warehouseId != null ? inventoryService.getOnHand(itemId, warehouseId)
                : inventoryService.getOnHandAllWarehouses(itemId);
        return ResponseEntity.ok(StockLevelResponse.builder()
                .itemId(itemId)
                .warehouseId(warehouseId)
                .quantity(qty)
                .build());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<List<LowStockResponse>> lowStock() {
        List<LowStockResponse> list = itemRepository.findAll().stream().map(item -> {
            Double qty = inventoryService.getOnHandAllWarehouses(item.getId());
            double reorder = item.getReorderLevel() != null ? item.getReorderLevel() : 0.0;
            if (qty <= reorder) {
                return LowStockResponse.builder()
                        .itemId(item.getId())
                        .sku(item.getSku())
                        .name(item.getName())
                        .quantity(qty)
                        .reorderLevel(reorder)
                        .build();
            }
            return null;
        }).filter(x -> x != null).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<List<MovementResponse>> allMovements() {
        return ResponseEntity.ok(inventoryService.allMovements().stream().map(m -> MovementResponse.builder()
                .id(m.getId())
                .itemId(m.getItem().getId())
                .warehouseId(m.getWarehouse().getId())
                .type(m.getType())
                .quantity(m.getQuantity())
                .reference(m.getReference())
                .createdAt(m.getCreatedAt())
                .build()).collect(Collectors.toList()));
    }
}

