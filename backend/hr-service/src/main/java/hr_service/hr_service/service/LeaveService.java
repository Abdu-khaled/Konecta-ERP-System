package hr_service.hr_service.service;

import hr_service.hr_service.model.Employee;
import hr_service.hr_service.model.LeaveRequest;
import hr_service.hr_service.model.LeaveStatus;
import hr_service.hr_service.repository.EmployeeRepository;
import hr_service.hr_service.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveRequest create(LeaveRequest request) {
        request.setStatus(LeaveStatus.PENDING);
        return leaveRepository.save(request);
    }

    public List<LeaveRequest> getByEmployee(Long employeeId) {
        Employee e = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
        return leaveRepository.findByEmployee(e);
    }

    public LeaveRequest approve(Long id) {
        LeaveRequest r = leaveRepository.findById(id).orElseThrow(() -> new RuntimeException("Leave not found"));
        r.setStatus(LeaveStatus.APPROVED);
        return leaveRepository.save(r);
    }

    public LeaveRequest reject(Long id) {
        LeaveRequest r = leaveRepository.findById(id).orElseThrow(() -> new RuntimeException("Leave not found"));
        r.setStatus(LeaveStatus.REJECTED);
        return leaveRepository.save(r);
    }
}
