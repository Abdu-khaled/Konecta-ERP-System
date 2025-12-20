package inventory_service.inventory_service.repository;

import inventory_service.inventory_service.model.Movement;

import java.util.List;

public interface MovementRepository {

    Double sumQuantityByItemAndWarehouse(Long itemId, Long warehouseId);

    Movement save(Movement movement);

    List<Movement> findAll();

    void deleteByItem_Id(Long itemId);

    void deleteByWarehouse_Id(Long warehouseId);
}
