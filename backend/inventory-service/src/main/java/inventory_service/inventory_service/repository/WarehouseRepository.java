package inventory_service.inventory_service.repository;

import inventory_service.inventory_service.model.Warehouse;

import java.util.List;
import java.util.Optional;

public interface WarehouseRepository {

    List<Warehouse> findAll();

    Optional<Warehouse> findById(Long id);

    Warehouse save(Warehouse warehouse);

    void deleteById(Long id);
}
