package hr_service.hr_service.service;

import hr_service.hr_service.model.Offboarding;
import hr_service.hr_service.repository.OffboardingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OffboardingService {
    private final OffboardingRepository repo;
    public Offboarding save(Offboarding o) { return repo.save(o); }
    public Offboarding findById(Long id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Offboarding not found")); }
    public List<Offboarding> findAll() { return repo.findAll(); }
}

