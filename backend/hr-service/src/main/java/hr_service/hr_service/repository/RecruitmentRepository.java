package hr_service.hr_service.repository;

import hr_service.hr_service.model.Recruitment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecruitmentRepository extends JpaRepository<Recruitment, Long> {
    List<Recruitment> findByType(String type);
}
