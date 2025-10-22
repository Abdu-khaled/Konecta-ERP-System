package hr_service.hr_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hr_service.hr_service.model.Department;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.security.JwtAuthFilter;
import hr_service.hr_service.security.SecurityConfig;
import hr_service.hr_service.service.DepartmentService;
import hr_service.hr_service.service.EmployeeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = EmployeeController.class)
@Import(SecurityConfig.class)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired

    @MockBean
    private EmployeeService employeeService;
    @MockBean
    private DepartmentService departmentService;
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
    @WithMockUser(roles = { "HR" })
    void getAll_requiresAuth_andReturns200() throws Exception {
        Employee e = Employee.builder().id(1L).firstName("Jane").lastName("Doe").email("jane@example.com").build();
        given(employeeService.findAll()).willReturn(List.of(e));

        mvc.perform(get("/api/hr/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    @WithMockUser(roles = { "HR" })
    void create_allowed_for_hr() throws Exception {
        Department dept = new Department();
        dept.setId(100L);
        given(departmentService.findById(100L)).willReturn(dept);

        Employee saved = Employee.builder().id(3L).firstName("New").lastName("Person").email("new@example.com").build();
        given(employeeService.create(any(Employee.class))).willReturn(saved);

        mvc.perform(post("/api/hr/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\n  \"firstName\": \"New\", \n \"lastName\": \"Person\", \n \"email\": \"new@example.com\", \n \"hireDate\": \"2025-01-10\", \n \"salary\": 3500, \n \"departmentId\": 100\n}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3));
    }

    @Test
    @WithMockUser(roles = { "EMPLOYEE" })
    void create_forbidden_for_employee() throws Exception {
        mvc.perform(post("/api/hr/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\n  \"firstName\": \"New\", \n \"lastName\": \"Person\", \n \"email\": \"new@example.com\"\n}"))
                .andExpect(status().isForbidden());
    }
}
