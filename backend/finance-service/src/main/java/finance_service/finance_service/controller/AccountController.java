package finance_service.finance_service.controller;

import finance_service.finance_service.dto.request.EnsureAccountRequest;
import finance_service.finance_service.dto.response.AccountResponse;
import finance_service.finance_service.model.Account;
import finance_service.finance_service.model.CardType;
import finance_service.finance_service.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountRepository accountRepository;

    @PostMapping("/ensure")
    public ResponseEntity<AccountResponse> ensure(@RequestBody EnsureAccountRequest req) {
        if (req == null || req.getAccountNumber() == null || req.getAccountNumber().isBlank() || req.getCardType() == null) {
            return ResponseEntity.badRequest().build();
        }
        // Upsert by userId if present, otherwise by email, then by username
        Account acc = null;
        if (req.getUserId() != null) {
            acc = accountRepository.findByUserId(req.getUserId()).orElse(null);
        }
        if (acc == null && req.getEmail() != null) {
            acc = accountRepository.findByEmailIgnoreCase(req.getEmail()).orElse(null);
        }
        if (acc == null && req.getUsername() != null) {
            acc = accountRepository.findByUsernameIgnoreCase(req.getUsername()).orElse(null);
        }
        if (acc == null) {
            acc = new Account();
        }
        acc.setUserId(req.getUserId());
        if (req.getUsername() != null) acc.setUsername(req.getUsername());
        if (req.getEmail() != null) acc.setEmail(req.getEmail());
        acc.setAccountNumber(req.getAccountNumber());
        acc.setCardType(req.getCardType());
        acc.setActive(Boolean.TRUE);
        Account saved = accountRepository.save(acc);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/by-email")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<AccountResponse> byEmail(@RequestParam String email) {
        return accountRepository.findByEmailIgnoreCase(email)
                .map(a -> ResponseEntity.ok(toResponse(a)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountResponse> myAccount() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String subject = auth != null ? auth.getName() : null;
        if (subject == null || subject.isBlank()) return ResponseEntity.status(403).build();
        var byEmail = accountRepository.findByEmailIgnoreCase(subject);
        if (byEmail.isPresent()) return ResponseEntity.ok(toResponse(byEmail.get()));
        var byUsername = accountRepository.findByUsernameIgnoreCase(subject);
        return byUsername.map(a -> ResponseEntity.ok(toResponse(a))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/by-emails")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<List<AccountResponse>> byEmails(@RequestBody List<String> emails) {
        List<AccountResponse> list = accountRepository.findByEmailInIgnoreCase(emails).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private AccountResponse toResponse(Account a) {
        return AccountResponse.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .username(a.getUsername())
                .email(a.getEmail())
                .accountNumber(a.getAccountNumber())
                .cardType(a.getCardType())
                .active(a.getActive())
                .build();
    }
}
