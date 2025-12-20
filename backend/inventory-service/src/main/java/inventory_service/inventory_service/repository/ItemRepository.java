package inventory_service.inventory_service.repository;

import inventory_service.inventory_service.model.Item;

import java.util.List;
import java.util.Optional;

public interface ItemRepository {
    List<Item> findAll();

    Optional<Item> findById(Long id);

    Optional<Item> findBySku(String sku);

    Item save(Item item);

    void deleteById(Long id);
}
