package hr_service.hr_service.data;

import hr_service.hr_service.model.Department;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.repository.DepartmentRepository;
import hr_service.hr_service.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Profile({"dev","docker"})
@RequiredArgsConstructor
public class DummyDataLoader implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DummyDataLoader.class);
    private final DepartmentRepository departments;
    private final EmployeeRepository employees;

    @Override
    public void run(String... args) {
        try {
            if (departments.count() == 0) {
                Department it = departments.save(Department.builder().name("IT").description("Information Technology").build());
                Department hr = departments.save(Department.builder().name("HR").description("Human Resources").build());
                employees.save(Employee.builder()
                        .firstName("Alice").lastName("Johnson").email("alice@example.com")
                        .position("Engineer").hireDate(LocalDate.now().minusDays(30)).salary(75000.0).department(it)
                        .build());
                employees.save(Employee.builder()
                        .firstName("Bob").lastName("Smith").email("bob@example.com")
                        .position("HR Specialist").hireDate(LocalDate.now().minusDays(60)).salary(65000.0).department(hr)
                        .build());
                log.info("Dummy HR data loaded.");
            }
        } catch (Exception e) {
            log.warn("Dummy data load skipped: {}", e.getMessage());
        }
    }
}

