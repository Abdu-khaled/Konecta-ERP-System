package finance_service.finance_service.repository;

import finance_service.finance_service.model.Expense;
import finance_service.finance_service.model.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findBySubmittedBy(Long submittedBy);
    List<Expense> findByStatus(ExpenseStatus status);
}

