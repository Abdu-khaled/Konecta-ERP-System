package finance_service.finance_service.repository;

import finance_service.finance_service.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    Optional<Payroll> findByEmployeeIdAndPeriod(Long employeeId, String period);
    List<Payroll> findByPeriod(String period);
    Optional<Payroll> findTopByEmployeeIdAndPeriodOrderByProcessedDateDescIdDesc(Long employeeId, String period);
}
