package hr_service.hr_service.repository;

import hr_service.hr_service.model.Job;
import hr_service.hr_service.model.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(JobStatus status);
}

