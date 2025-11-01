package inventory_service.inventory_service.repository;

import inventory_service.inventory_service.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
}

