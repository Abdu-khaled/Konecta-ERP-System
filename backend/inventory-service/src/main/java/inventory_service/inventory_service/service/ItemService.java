package inventory_service.inventory_service.service;

import inventory_service.inventory_service.model.Item;
import inventory_service.inventory_service.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;

    public List<Item> findAll() { return itemRepository.findAll(); }

    public Item findById(Long id) { return itemRepository.findById(id).orElseThrow(); }

    public Item create(Item i) { return itemRepository.save(i); }

    public Item update(Long id, Item data) {
        Item ex = findById(id);
        ex.setSku(data.getSku());
        ex.setName(data.getName());
        ex.setDescription(data.getDescription());
        ex.setUnit(data.getUnit());
        ex.setReorderLevel(data.getReorderLevel());
        return itemRepository.save(ex);
    }

    public void delete(Long id) { itemRepository.deleteById(id); }
}

