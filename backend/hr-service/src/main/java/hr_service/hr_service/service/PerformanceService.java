package hr_service.hr_service.service;

import hr_service.hr_service.model.Employee;
import hr_service.hr_service.model.Performance;
import hr_service.hr_service.repository.EmployeeRepository;
import hr_service.hr_service.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceService {
    private final PerformanceRepository performanceRepository;
    private final EmployeeRepository employeeRepository;

    public Performance create(Performance p) {
        return performanceRepository.save(p);
    }

    public List<Performance> getByEmployee(Long employeeId) {
        Employee e = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
        return performanceRepository.findByEmployee(e);
    }
}
