package inventory_service.inventory_service.controller;

import inventory_service.inventory_service.dto.request.ItemRequest;
import inventory_service.inventory_service.model.Item;
import inventory_service.inventory_service.security.JwtAuthFilter;
import inventory_service.inventory_service.security.SecurityConfig;
import inventory_service.inventory_service.service.ItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ItemController.class)
@Import(SecurityConfig.class)
class ItemControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private ItemService itemService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @BeforeEach
    void passThroughJwtFilter() throws Exception {
        doAnswer(inv -> {
            jakarta.servlet.http.HttpServletRequest req = inv.getArgument(0);
            jakarta.servlet.http.HttpServletResponse res = inv.getArgument(1);
            jakarta.servlet.FilterChain chain = inv.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any());
    }

    @Test
    @WithMockUser(roles = { "INVENTORY" })
    void create_allowed_for_inventory_role() throws Exception {
        Item item = Item.builder().id(1L).sku("SKU-1").name("Widget").build();
        given(itemService.create(any())).willReturn(item);
        mvc.perform(post("/api/inventory/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\n  \"sku\": \"SKU-1\", \n \"name\": \"Widget\"\n}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("SKU-1"));
    }

    @Test
    @WithMockUser(roles = { "EMPLOYEE" })
    void create_forbidden_for_employee() throws Exception {
        mvc.perform(post("/api/inventory/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\n  \"sku\": \"SKU-1\", \n \"name\": \"Widget\"\n}"))
                .andExpect(status().isForbidden());
    }
}
