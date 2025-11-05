package hr_service.hr_service.repository;

import hr_service.hr_service.model.Employee;
import hr_service.hr_service.model.Training;
import hr_service.hr_service.model.TrainingEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, Long> {
    List<TrainingEnrollment> findByEmployee(Employee employee);
    List<TrainingEnrollment> findByTraining(Training training);
    boolean existsByEmployeeAndTraining(Employee employee, Training training);
    Optional<TrainingEnrollment> findByEmployeeAndTraining(Employee employee, Training training);
}

