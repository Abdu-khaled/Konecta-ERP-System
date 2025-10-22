package hr_service.hr_service.controller;

import hr_service.hr_service.model.Employee;
import hr_service.hr_service.model.LeaveRequest;
import hr_service.hr_service.model.LeaveStatus;
import hr_service.hr_service.security.JwtAuthFilter;
import hr_service.hr_service.security.SecurityConfig;
import hr_service.hr_service.service.EmployeeService;
import hr_service.hr_service.service.LeaveService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = LeaveController.class)
@Import(SecurityConfig.class)
class LeaveControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private LeaveService leaveService;
    @MockBean
    private EmployeeService employeeService;
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
    void create_leave_pending() throws Exception {
        Employee e = Employee.builder().id(1L).firstName("A").lastName("B").email("e@x.com").build();
        given(employeeService.findById(1L)).willReturn(e);
        LeaveRequest saved = LeaveRequest.builder().id(2L).employee(e).status(LeaveStatus.PENDING).build();
        given(leaveService.create(any(LeaveRequest.class))).willReturn(saved);

        mvc.perform(post("/api/hr/leaves")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\n  \"employeeId\": 1, \n \"startDate\": \"2025-01-20\", \n \"endDate\": \"2025-01-22\", \n \"reason\": \"Medical\"\n}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = { "HR" })
    void approve_leave_ok() throws Exception {
        LeaveRequest approved = LeaveRequest.builder().id(2L).status(LeaveStatus.APPROVED).build();
        given(leaveService.approve(2L)).willReturn(approved);

        mvc.perform(put("/api/hr/leaves/2/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}
