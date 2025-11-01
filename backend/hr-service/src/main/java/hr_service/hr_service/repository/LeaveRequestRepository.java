package hr_service.hr_service.repository;

import hr_service.hr_service.model.Employee;
import hr_service.hr_service.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployee(Employee employee);
}
