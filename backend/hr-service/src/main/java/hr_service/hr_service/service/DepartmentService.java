package hr_service.hr_service.service;

import hr_service.hr_service.model.Department;
import hr_service.hr_service.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    public List<Department> findAll() { return departmentRepository.findAll(); }
    public Department findById(Long id) { return departmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Department not found")); }
    public Department create(Department dept) { return departmentRepository.save(dept); }
    public Department update(Long id, Department updated) {
        Department d = findById(id);
        d.setName(updated.getName());
        d.setDescription(updated.getDescription());
        return departmentRepository.save(d);
    }
    public void delete(Long id) { departmentRepository.deleteById(id); }
}
