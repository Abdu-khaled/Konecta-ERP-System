package hr_service.hr_service.service;

import hr_service.hr_service.model.Employee;
import hr_service.hr_service.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }

    public Employee findById(Long id) {
        return employeeRepository.findById(id).orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public Employee create(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Employee update(Long id, Employee updated) {
        Employee emp = findById(id);
        emp.setFirstName(updated.getFirstName());
        emp.setLastName(updated.getLastName());
        emp.setEmail(updated.getEmail());
        emp.setPhone(updated.getPhone());
        emp.setPosition(updated.getPosition());
        emp.setHireDate(updated.getHireDate());
        emp.setSalary(updated.getSalary());
        emp.setDepartment(updated.getDepartment());
        return employeeRepository.save(emp);
    }

    public void delete(Long id) {
        employeeRepository.deleteById(id);
    }
}
