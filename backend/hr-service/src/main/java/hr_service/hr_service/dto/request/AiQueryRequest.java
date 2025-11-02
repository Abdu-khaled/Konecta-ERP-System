package hr_service.hr_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiQueryRequest {
    private String text;
    private String sessionId;
    private Map<String, Object> payload;
}

