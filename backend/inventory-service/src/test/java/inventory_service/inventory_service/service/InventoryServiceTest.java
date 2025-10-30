package inventory_service.inventory_service.service;

import inventory_service.inventory_service.dto.request.MovementRequest;
import inventory_service.inventory_service.model.*;
import inventory_service.inventory_service.repository.ItemRepository;
import inventory_service.inventory_service.repository.MovementRepository;
import inventory_service.inventory_service.repository.WarehouseRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class InventoryServiceTest {

    @Test
    void prevents_negative_stock_on_out() {
        MovementRepository movementRepository = Mockito.mock(MovementRepository.class);
        ItemRepository itemRepository = Mockito.mock(ItemRepository.class);
        WarehouseRepository warehouseRepository = Mockito.mock(WarehouseRepository.class);

        InventoryService service = new InventoryService(movementRepository, itemRepository, warehouseRepository);

        Item item = Item.builder().id(1L).sku("A").name("A").build();
        Warehouse wh = Warehouse.builder().id(2L).name("Main").build();
        when(itemRepository.findById(1L)).thenReturn(java.util.Optional.of(item));
        when(warehouseRepository.findById(2L)).thenReturn(java.util.Optional.of(wh));
        when(movementRepository.sumQuantityByItemAndWarehouse(1L, 2L)).thenReturn(5.0);

        MovementRequest req = new MovementRequest();
        req.setItemId(1L); req.setWarehouseId(2L); req.setType(MovementType.OUT); req.setQuantity(10.0);

        assertThrows(IllegalArgumentException.class, () -> service.recordMovement(req));
    }

    @Test
    void calculates_on_hand() {
        MovementRepository movementRepository = Mockito.mock(MovementRepository.class);
        ItemRepository itemRepository = Mockito.mock(ItemRepository.class);
        WarehouseRepository warehouseRepository = Mockito.mock(WarehouseRepository.class);

        InventoryService service = new InventoryService(movementRepository, itemRepository, warehouseRepository);
        when(movementRepository.sumQuantityByItemAndWarehouse(1L, null)).thenReturn(12.5);
        assertEquals(12.5, service.getOnHandAllWarehouses(1L));
    }
}

