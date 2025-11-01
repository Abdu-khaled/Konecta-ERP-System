package hr_service.hr_service.service;

import hr_service.hr_service.model.Onboarding;
import hr_service.hr_service.repository.OnboardingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OnboardingService {
    private final OnboardingRepository repo;
    public Onboarding save(Onboarding o) { return repo.save(o); }
    public Onboarding findById(Long id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Onboarding not found")); }
    public List<Onboarding> findAll() { return repo.findAll(); }
}

