package hr_service.hr_service.controller;

import hr_service.hr_service.dto.request.AiQueryRequest;
import hr_service.hr_service.dto.response.AiQueryResponse;
import hr_service.hr_service.service.AiWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiWebhookService aiWebhookService;

    @PostMapping("/query")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<AiQueryResponse> query(@RequestBody AiQueryRequest req) {
        AiQueryResponse result = aiWebhookService.query(req);
        return ResponseEntity.status(result.getStatusCode()).body(result);
    }
}

