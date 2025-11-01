package inventory_service.inventory_service.controller;

import inventory_service.inventory_service.dto.request.ItemRequest;
import inventory_service.inventory_service.dto.response.ItemResponse;
import inventory_service.inventory_service.model.Item;
import inventory_service.inventory_service.service.ItemService;
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

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAll() {
        return ResponseEntity.ok(itemService.findAll().stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(itemService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<ItemResponse> create(@RequestBody ItemRequest req) {
        Item i = fromRequest(req);
        return ResponseEntity.ok(toResponse(itemService.create(i)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<ItemResponse> update(@PathVariable Long id, @RequestBody ItemRequest req) {
        Item i = fromRequest(req);
        return ResponseEntity.ok(toResponse(itemService.update(id, i)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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

    private ItemResponse toResponse(Item i) {
        return ItemResponse.builder()
                .id(i.getId())
                .sku(i.getSku())
                .name(i.getName())
                .description(i.getDescription())
                .unit(i.getUnit())
                .reorderLevel(i.getReorderLevel())
                .build();
    }
}

