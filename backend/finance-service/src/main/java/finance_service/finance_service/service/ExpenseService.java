package finance_service.finance_service.service;

import finance_service.finance_service.model.Expense;
import finance_service.finance_service.model.ExpenseStatus;
import finance_service.finance_service.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;

    public Expense submit(Expense e) {
        e.setStatus(ExpenseStatus.PENDING);
        e.setCreatedAt(LocalDateTime.now());
        e.setSource(finance_service.finance_service.model.ExpenseSource.USER);
        return expenseRepository.save(e);
    }

    public Expense approve(Long id, Long approverId) {
        Expense e = expenseRepository.findById(id).orElseThrow();
        e.setStatus(ExpenseStatus.APPROVED);
        e.setApprovedBy(approverId);
        return expenseRepository.save(e);
    }

    public Expense reject(Long id, Long approverId) {
        Expense e = expenseRepository.findById(id).orElseThrow();
        e.setStatus(ExpenseStatus.REJECTED);
        e.setApprovedBy(approverId);
        return expenseRepository.save(e);
    }

    public List<Expense> bySubmitter(Long submittedBy) {
        return expenseRepository.findBySubmittedBy(submittedBy);
    }

    public List<Expense> byStatus(ExpenseStatus status) {
        return expenseRepository.findByStatus(status);
    }

    public List<Expense> listAll() {
        return expenseRepository.findAll();
    }
}
