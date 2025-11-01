package finance_service.finance_service.service;

import finance_service.finance_service.model.Expense;
import finance_service.finance_service.model.ExpenseStatus;
import finance_service.finance_service.repository.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private ExpenseService expenseService;

    @Test
    void submit_setsPendingAndCreatedAt() {
        given(expenseRepository.save(any(Expense.class))).willAnswer(inv -> inv.getArgument(0));
        Expense e = Expense.builder().submittedBy(1L).category("Travel").amount(10.0).build();
        Expense saved = expenseService.submit(e);
        assertThat(saved.getStatus()).isEqualTo(ExpenseStatus.PENDING);
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void approve_setsApprovedAndApprover() {
        Expense e = new Expense();
        e.setId(3L);
        when(expenseRepository.findById(3L)).thenReturn(Optional.of(e));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(inv -> inv.getArgument(0));

        Expense saved = expenseService.approve(3L, 99L);
        assertThat(saved.getStatus()).isEqualTo(ExpenseStatus.APPROVED);
        assertThat(saved.getApprovedBy()).isEqualTo(99L);
    }

    @Test
    void reject_setsRejectedAndApprover() {
        Expense e = new Expense();
        e.setId(4L);
        when(expenseRepository.findById(4L)).thenReturn(Optional.of(e));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(inv -> inv.getArgument(0));

        Expense saved = expenseService.reject(4L, 77L);
        assertThat(saved.getStatus()).isEqualTo(ExpenseStatus.REJECTED);
        assertThat(saved.getApprovedBy()).isEqualTo(77L);
    }
}
