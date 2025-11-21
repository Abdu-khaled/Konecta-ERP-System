package hr_service.hr_service.controller;

import hr_service.hr_service.model.Attendance;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.security.JwtAuthFilter;
import hr_service.hr_service.security.SecurityConfig;
import hr_service.hr_service.service.AttendanceService;
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

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AttendanceController.class)
@Import(SecurityConfig.class)
class AttendanceControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private AttendanceService attendanceService;
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
    @WithMockUser(username = "e@x.com", roles = { "EMPLOYEE" })
    void mark_attendance_allowed_for_employee() throws Exception {
        Employee e = Employee.builder().id(1L).firstName("A").lastName("B").email("e@x.com").build();
        given(employeeService.findByEmail("e@x.com")).willReturn(e);
        Attendance saved = Attendance.builder().id(5L).employee(e).date(LocalDate.parse("2025-01-15")).present(true)
                .workingHours(8.0).build();
        given(attendanceService.markAttendance(any(Attendance.class))).willReturn(saved);

        mvc.perform(post("/api/hr/attendance")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\n" +
                                "  \"employeeId\": 1,\n" +
                                "  \"date\": \"2025-01-15\",\n" +
                                "  \"present\": true,\n" +
                                "  \"workingHours\": 8,\n" +
                                "  \"latitude\": 30.03015869278751,\n" +
                                "  \"longitude\": 31.454971192763708\n" +
                                "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    @WithMockUser(roles = { "HR" })
    void mark_attendance_forbidden_for_employee() throws Exception {
        mvc.perform(post("/api/hr/attendance")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\n  \"employeeId\": 1, \n \"date\": \"2025-01-15\", \n \"present\": true, \n \"workingHours\": 8\n}"))
                .andExpect(status().isForbidden());
    }
}
