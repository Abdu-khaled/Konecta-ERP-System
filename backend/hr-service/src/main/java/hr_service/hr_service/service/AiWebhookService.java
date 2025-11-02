package hr_service.hr_service.service;

import hr_service.hr_service.dto.request.AiQueryRequest;
import hr_service.hr_service.dto.response.AiQueryResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Service
public class AiWebhookService {

    private final RestTemplate restTemplate;

    @Value("${ai.webhook.url:}")
    private String webhookUrl;

    public AiWebhookService() {
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(8000);
        rf.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(rf);
        this.restTemplate.setErrorHandler(new ResponseErrorHandler() {
            @Override
            public boolean hasError(ClientHttpResponse response) throws IOException {
                // Do not throw exceptions for 4xx/5xx; let caller inspect status
                return false;
            }

            @Override
            public void handleError(ClientHttpResponse response) throws IOException {
                // No-op: handled by caller based on status code
            }
        });
    }

    public AiQueryResponse query(AiQueryRequest request) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            throw new IllegalStateException("AI webhook URL is not configured (ai.webhook.url)");
        }

        String text = request.getText() != null ? request.getText() : "";
        String sessionId = request.getSessionId() != null && !request.getSessionId().isBlank()
                ? request.getSessionId()
                : UUID.randomUUID().toString();

        String uri = UriComponentsBuilder.fromHttpUrl(webhookUrl)
                .queryParam("text", text)
                .queryParam("sessionID", sessionId)
                .build()
                .encode(java.nio.charset.StandardCharsets.UTF_8)
                .toUriString();

        Map<String, Object> body = request.getPayload() != null ? request.getPayload() : Collections.emptyMap();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.ALL));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> resp = restTemplate.exchange(uri, HttpMethod.POST, entity, String.class);

            MediaType ct = resp.getHeaders().getContentType();
            String contentType = ct != null ? ct.toString() : "text/plain";

            return AiQueryResponse.builder()
                    .statusCode(resp.getStatusCodeValue())
                    .contentType(contentType)
                    .content(resp.getBody())
                    .build();
        } catch (ResourceAccessException e) {
            return AiQueryResponse.builder()
                    .statusCode(502)
                    .contentType("text/plain")
                    .content("AI webhook unreachable or offline: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            return AiQueryResponse.builder()
                    .statusCode(500)
                    .contentType("text/plain")
                    .content("AI webhook error: " + e.getMessage())
                    .build();
        }
    }
}
