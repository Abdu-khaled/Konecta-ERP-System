package inventory_service.inventory_service.repository.jdbc;

import inventory_service.inventory_service.model.Warehouse;
import inventory_service.inventory_service.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class JdbcWarehouseRepository implements WarehouseRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<Warehouse> WAREHOUSE_ROW_MAPPER = (rs, rowNum) -> Warehouse.builder()
            .id(rs.getLong("id"))
            .name(rs.getString("name"))
            .location(rs.getString("location"))
            .build();

    @Override
    public List<Warehouse> findAll() {
        return jdbcTemplate.query("SELECT id, name, location FROM inv_warehouse", WAREHOUSE_ROW_MAPPER);
    }

    @Override
    public Optional<Warehouse> findById(Long id) {
        List<Warehouse> list = jdbcTemplate.query(
                "SELECT id, name, location FROM inv_warehouse WHERE id = ?",
                WAREHOUSE_ROW_MAPPER,
                id
        );
        return list.stream().findFirst();
    }

    @Override
    public Warehouse save(Warehouse warehouse) {
        if (warehouse.getId() == null) {
            return insert(warehouse);
        }
        return update(warehouse);
    }

    private Warehouse insert(Warehouse warehouse) {
        String sql = "INSERT INTO inv_warehouse (name, location) VALUES (?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql + " RETURNING id", Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, warehouse.getName());
            ps.setString(2, warehouse.getLocation());
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key != null) {
            warehouse.setId(key.longValue());
        }
        return warehouse;
    }

    private Warehouse update(Warehouse warehouse) {
        jdbcTemplate.update(
                "UPDATE inv_warehouse SET name = ?, location = ? WHERE id = ?",
                warehouse.getName(),
                warehouse.getLocation(),
                warehouse.getId()
        );
        return warehouse;
    }

    @Override
    public void deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM inv_warehouse WHERE id = ?", id);
    }
}

