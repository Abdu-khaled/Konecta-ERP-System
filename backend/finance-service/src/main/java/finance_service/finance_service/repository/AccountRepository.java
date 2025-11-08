package finance_service.finance_service.repository;

import finance_service.finance_service.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByUserId(Long userId);
    Optional<Account> findByEmailIgnoreCase(String email);
    Optional<Account> findByUsernameIgnoreCase(String username);
    List<Account> findByEmailInIgnoreCase(List<String> emails);
}

