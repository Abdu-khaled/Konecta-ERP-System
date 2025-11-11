package inventory_service.inventory_service.repository;

import inventory_service.inventory_service.model.Movement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovementRepository extends JpaRepository<Movement, Long> {

    @Query("select coalesce(sum(case when m.type = inventory_service.inventory_service.model.MovementType.IN then m.quantity " +
            " when m.type = inventory_service.inventory_service.model.MovementType.OUT then -m.quantity " +
            " else m.quantity end), 0) " +
            " from Movement m where m.item.id = :itemId " +
            " and (:warehouseId is null or m.warehouse.id = :warehouseId)")
    Double sumQuantityByItemAndWarehouse(@Param("itemId") Long itemId,
                                         @Param("warehouseId") Long warehouseId);

    void deleteByItem_Id(Long itemId);

    void deleteByWarehouse_Id(Long warehouseId);
}
