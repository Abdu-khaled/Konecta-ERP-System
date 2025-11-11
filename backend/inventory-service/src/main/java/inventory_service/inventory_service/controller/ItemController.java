package inventory_service.inventory_service.controller;

import inventory_service.inventory_service.dto.request.ItemRequest;
import inventory_service.inventory_service.dto.request.MovementRequest;
import inventory_service.inventory_service.dto.response.ItemResponse;
import inventory_service.inventory_service.model.Item;
import inventory_service.inventory_service.model.MovementType;
import inventory_service.inventory_service.service.ItemService;
import inventory_service.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAll() {
        return ResponseEntity.ok(itemService.findAll().stream().map(this::toResponseWithQty).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponseWithQty(itemService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<ItemResponse> create(@RequestBody ItemRequest req) {
        Item i = fromRequest(req);
        Item saved = itemService.create(i);

        Double initQty = req.getInitialQuantity();
        Long whId = req.getWarehouseId();
        if (initQty != null && initQty > 0 && whId != null) {
            MovementRequest mr = new MovementRequest();
            mr.setItemId(saved.getId());
            mr.setWarehouseId(whId);
            mr.setType(MovementType.IN);
            mr.setQuantity(initQty);
            mr.setReference("Initial stock");
            inventoryService.recordMovement(mr);
        }

        return ResponseEntity.ok(toResponseWithQty(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<ItemResponse> update(@PathVariable Long id, @RequestBody ItemRequest req) {
        Item i = fromRequest(req);
        return ResponseEntity.ok(toResponseWithQty(itemService.update(id, i)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private Item fromRequest(ItemRequest r) {
        return Item.builder()
                .sku(r.getSku())
                .name(r.getName())
                .description(r.getDescription())
                .unit(r.getUnit())
                .reorderLevel(r.getReorderLevel())
                .build();
    }

    private ItemResponse toResponseWithQty(Item i) {
        Double qty = inventoryService.getOnHandAllWarehouses(i.getId());
        return ItemResponse.builder()
                .id(i.getId())
                .sku(i.getSku())
                .name(i.getName())
                .description(i.getDescription())
                .unit(i.getUnit())
                .reorderLevel(i.getReorderLevel())
                .quantity(qty)
                .build();
    }
}
