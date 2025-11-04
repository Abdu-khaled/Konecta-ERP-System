package hr_service.hr_service.service;

import hr_service.hr_service.model.Recruitment;
import hr_service.hr_service.repository.RecruitmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruitmentService {
    private final RecruitmentRepository repo;

    public Recruitment save(Recruitment r) { return repo.save(r); }
    public Recruitment findById(Long id) { return repo.findById(id).orElse(null); }
    public List<Recruitment> findAll() { return repo.findAll(); }
    public List<Recruitment> findJobs() { return repo.findByType("JOB"); }
    public void delete(Long id) { repo.deleteById(id); }
}
