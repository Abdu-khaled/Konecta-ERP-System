package hr_service.hr_service.service;

import hr_service.hr_service.model.Department;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @Test
    void update_copiesFieldsAndSaves() {
        Employee existing = Employee.builder()
                .id(1L)
                .firstName("Old")
                .lastName("Name")
                .email("old@example.com")
                .build();

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(inv -> inv.getArgument(0));

        Department dept = new Department();
        dept.setId(99L);
        Employee updated = Employee.builder()
                .firstName("New")
                .lastName("Person")
                .email("new@example.com")
                .phone("555")
                .position("Dev")
                .hireDate(LocalDate.of(2025,1,1))
                .salary(4000.0)
                .department(dept)
                .build();

        Employee saved = employeeService.update(1L, updated);

        assertThat(saved.getFirstName()).isEqualTo("New");
        assertThat(saved.getEmail()).isEqualTo("new@example.com");
        assertThat(saved.getDepartment()).isSameAs(dept);
        assertThat(saved.getSalary()).isEqualTo(4000.0);
    }
}

