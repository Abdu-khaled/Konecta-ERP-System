package hr_service.hr_service.repository;

import hr_service.hr_service.model.Employee;
import hr_service.hr_service.model.Performance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findByEmployee(Employee employee);
}
