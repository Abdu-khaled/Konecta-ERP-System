package finance_service.finance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportSummary {
    private int inserted;
    private int updated;
    private int skipped;
    private List<String> errors = new ArrayList<>();
}

