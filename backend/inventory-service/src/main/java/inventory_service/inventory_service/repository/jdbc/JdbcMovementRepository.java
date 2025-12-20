package inventory_service.inventory_service.repository.jdbc;

import inventory_service.inventory_service.model.Item;
import inventory_service.inventory_service.model.Movement;
import inventory_service.inventory_service.model.MovementType;
import inventory_service.inventory_service.model.Warehouse;
import inventory_service.inventory_service.repository.MovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class JdbcMovementRepository implements MovementRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<Movement> MOVEMENT_ROW_MAPPER = (rs, rowNum) -> Movement.builder()
            .id(rs.getLong("id"))
            .item(Item.builder().id(rs.getLong("item_id")).build())
            .warehouse(Warehouse.builder().id(rs.getLong("warehouse_id")).build())
            .type(MovementType.valueOf(rs.getString("type")))
            .quantity(rs.getDouble("quantity"))
            .reference(rs.getString("reference"))
            .createdAt(rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toInstant() : null)
            .build();

    @Override
    public Double sumQuantityByItemAndWarehouse(Long itemId, Long warehouseId) {
        if (warehouseId == null) {
            Double result = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(SUM(CASE " +
                            "WHEN type = 'IN'  THEN quantity " +
                            "WHEN type = 'OUT' THEN -quantity " +
                            "ELSE quantity END), 0) AS on_hand " +
                            "FROM inv_movement WHERE item_id = ?",
                    Double.class,
                    itemId
            );
            return result != null ? result : 0.0;
        }

        Double result = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(CASE " +
                        "WHEN type = 'IN'  THEN quantity " +
                        "WHEN type = 'OUT' THEN -quantity " +
                        "ELSE quantity END), 0) AS on_hand " +
                        "FROM inv_movement WHERE item_id = ? AND warehouse_id = ?",
                Double.class,
                itemId,
                warehouseId
        );
        return result != null ? result : 0.0;
    }

    @Override
    public Movement save(Movement movement) {
        if (movement.getId() == null) {
            return insert(movement);
        }
        // For this domain we don't update movements; implement as no-op update of quantity/reference if needed
        jdbcTemplate.update(
                "UPDATE inv_movement SET item_id = ?, warehouse_id = ?, type = ?, quantity = ?, reference = ? WHERE id = ?",
                movement.getItem().getId(),
                movement.getWarehouse().getId(),
                movement.getType().name(),
                movement.getQuantity(),
                movement.getReference(),
                movement.getId()
        );
        return movement;
    }

    private Movement insert(Movement movement) {
        String sql = "INSERT INTO inv_movement (item_id, warehouse_id, type, quantity, reference, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        Instant createdAt = movement.getCreatedAt() != null ? movement.getCreatedAt() : Instant.now();

        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql + " RETURNING id", Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, movement.getItem().getId());
            ps.setLong(2, movement.getWarehouse().getId());
            ps.setString(3, movement.getType().name());
            ps.setDouble(4, movement.getQuantity());
            ps.setString(5, movement.getReference());
            ps.setTimestamp(6, Timestamp.from(createdAt));
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            movement.setId(key.longValue());
        }
        movement.setCreatedAt(createdAt);
        return movement;
    }

    @Override
    public List<Movement> findAll() {
        return jdbcTemplate.query(
                "SELECT id, item_id, warehouse_id, type, quantity, reference, created_at " +
                        "FROM inv_movement ORDER BY created_at DESC",
                MOVEMENT_ROW_MAPPER
        );
    }

    @Override
    public void deleteByItem_Id(Long itemId) {
        jdbcTemplate.update("DELETE FROM inv_movement WHERE item_id = ?", itemId);
    }

    @Override
    public void deleteByWarehouse_Id(Long warehouseId) {
        jdbcTemplate.update("DELETE FROM inv_movement WHERE warehouse_id = ?", warehouseId);
    }
}

