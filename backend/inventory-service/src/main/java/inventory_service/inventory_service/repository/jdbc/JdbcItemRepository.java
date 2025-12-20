package inventory_service.inventory_service.repository.jdbc;

import inventory_service.inventory_service.model.Item;
import inventory_service.inventory_service.repository.ItemRepository;
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
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class JdbcItemRepository implements ItemRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<Item> ITEM_ROW_MAPPER = (rs, rowNum) -> Item.builder()
            .id(rs.getLong("id"))
            .sku(rs.getString("sku"))
            .name(rs.getString("name"))
            .description(rs.getString("description"))
            .unit(rs.getString("unit"))
            .reorderLevel(rs.getObject("reorder_level") != null ? rs.getDouble("reorder_level") : null)
            .createdAt(rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toInstant() : null)
            .build();

    @Override
    public List<Item> findAll() {
        return jdbcTemplate.query("SELECT id, sku, name, description, unit, reorder_level, created_at FROM inv_item", ITEM_ROW_MAPPER);
    }

    @Override
    public Optional<Item> findById(Long id) {
        List<Item> list = jdbcTemplate.query(
                "SELECT id, sku, name, description, unit, reorder_level, created_at FROM inv_item WHERE id = ?",
                ITEM_ROW_MAPPER,
                id
        );
        return list.stream().findFirst();
    }

    @Override
    public Optional<Item> findBySku(String sku) {
        List<Item> list = jdbcTemplate.query(
                "SELECT id, sku, name, description, unit, reorder_level, created_at FROM inv_item WHERE sku = ?",
                ITEM_ROW_MAPPER,
                sku
        );
        return list.stream().findFirst();
    }

    @Override
    public Item save(Item item) {
        if (item.getId() == null) {
            return insert(item);
        }
        return update(item);
    }

    private Item insert(Item item) {
        String sql = "INSERT INTO inv_item (sku, name, description, unit, reorder_level, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?) ";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        Instant createdAt = item.getCreatedAt() != null ? item.getCreatedAt() : Instant.now();
        Double reorderLevel = item.getReorderLevel() != null ? item.getReorderLevel() : 0.0;

        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql + "RETURNING id", Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, item.getSku());
            ps.setString(2, item.getName());
            ps.setString(3, item.getDescription());
            ps.setString(4, item.getUnit());
            ps.setObject(5, reorderLevel);
            ps.setTimestamp(6, Timestamp.from(createdAt));
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            item.setId(key.longValue());
        }
        item.setCreatedAt(createdAt);
        item.setReorderLevel(reorderLevel);
        return item;
    }

    private Item update(Item item) {
        String sql = "UPDATE inv_item SET sku = ?, name = ?, description = ?, unit = ?, reorder_level = ? " +
                "WHERE id = ?";
        Double reorderLevel = item.getReorderLevel() != null ? item.getReorderLevel() : 0.0;
        jdbcTemplate.update(
                sql,
                item.getSku(),
                item.getName(),
                item.getDescription(),
                item.getUnit(),
                reorderLevel,
                item.getId()
        );
        item.setReorderLevel(reorderLevel);
        return item;
    }

    @Override
    public void deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM inv_item WHERE id = ?", id);
    }
}

