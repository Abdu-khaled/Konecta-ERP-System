package inventory_service.inventory_service.service;

import inventory_service.inventory_service.dto.request.MovementRequest;
import inventory_service.inventory_service.model.*;
import inventory_service.inventory_service.repository.ItemRepository;
import inventory_service.inventory_service.repository.MovementRepository;
import inventory_service.inventory_service.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final MovementRepository movementRepository;
    private final ItemRepository itemRepository;
    private final WarehouseRepository warehouseRepository;

    @Transactional
    public Movement recordMovement(MovementRequest req) {
        Item item = itemRepository.findById(req.getItemId()).orElseThrow();
        Warehouse wh = warehouseRepository.findById(req.getWarehouseId()).orElseThrow();
        double qty = req.getQuantity() != null ? req.getQuantity() : 0.0;
        if (qty <= 0 && req.getType() != MovementType.ADJUST) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        // Prevent going negative unless ADJUST explicitly allows it
        if (req.getType() == MovementType.OUT) {
            Double onHand = getOnHand(item.getId(), wh.getId());
            if (onHand < qty) {
                throw new IllegalArgumentException("Insufficient stock");
            }
        }
        Movement m = Movement.builder()
                .item(item)
                .warehouse(wh)
                .type(req.getType())
                .quantity(qty)
                .reference(req.getReference())
                .build();
        return movementRepository.save(m);
    }

    public Double getOnHand(Long itemId, Long warehouseId) {
        return movementRepository.sumQuantityByItemAndWarehouse(itemId, warehouseId);
    }

    public Double getOnHandAllWarehouses(Long itemId) {
        return movementRepository.sumQuantityByItemAndWarehouse(itemId, null);
    }

    public List<Movement> allMovements() { return movementRepository.findAll(); }
}

