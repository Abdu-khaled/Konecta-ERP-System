package hr_service.hr_service.repository;

import hr_service.hr_service.model.Attendance;
import hr_service.hr_service.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployee(Employee employee);
}
