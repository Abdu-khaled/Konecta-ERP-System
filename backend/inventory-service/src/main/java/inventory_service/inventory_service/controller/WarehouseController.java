package inventory_service.inventory_service.controller;

import inventory_service.inventory_service.model.Warehouse;
import inventory_service.inventory_service.repository.WarehouseRepository;
import inventory_service.inventory_service.repository.MovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/warehouses")
@RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseRepository warehouseRepository;
    private final MovementRepository movementRepository;

    @GetMapping
    public ResponseEntity<List<Warehouse>> all() { return ResponseEntity.ok(warehouseRepository.findAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<Warehouse> byId(@PathVariable Long id) { return ResponseEntity.ok(warehouseRepository.findById(id).orElseThrow()); }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<Warehouse> create(@RequestBody Warehouse w) { return ResponseEntity.ok(warehouseRepository.save(w)); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<Warehouse> update(@PathVariable Long id, @RequestBody Warehouse w) {
        Warehouse ex = warehouseRepository.findById(id).orElseThrow();
        ex.setName(w.getName());
        ex.setLocation(w.getLocation());
        return ResponseEntity.ok(warehouseRepository.save(ex));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        movementRepository.deleteByWarehouse_Id(id);
        warehouseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
