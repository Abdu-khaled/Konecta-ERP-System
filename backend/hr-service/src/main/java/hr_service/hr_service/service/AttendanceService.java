package hr_service.hr_service.service;

import hr_service.hr_service.model.Attendance;
import hr_service.hr_service.model.Employee;
import hr_service.hr_service.repository.AttendanceRepository;
import hr_service.hr_service.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public Attendance markAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getByEmployee(Long employeeId) {
        Employee e = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
        return attendanceRepository.findByEmployee(e);
    }
}
