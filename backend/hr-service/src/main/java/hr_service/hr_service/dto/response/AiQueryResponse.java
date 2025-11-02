package hr_service.hr_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiQueryResponse {
    private int statusCode;
    private String contentType;
    private String content;
}

