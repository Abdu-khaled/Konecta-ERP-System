package finance_service.finance_service.service;

import finance_service.finance_service.dto.request.InvoiceItemRequest;
import finance_service.finance_service.dto.request.InvoiceRequest;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class AiExtractionClient {

    public InvoiceRequest extractInvoice(Long invoiceId, String filename, byte[] pdfBytes) {
        String baseUrl = firstNonBlank(System.getProperty("ai.extraction.url"), System.getenv("AI_EXTRACTION_URL"));
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException("AI extraction URL not configured (AI_EXTRACTION_URL)");
        }

        String key = System.getenv("AI_EXTRACTION_KEY");
        String session = firstNonBlank(System.getenv("AI_EXTRACTION_SESSION_ID"),
                invoiceId == null ? null : String.valueOf(invoiceId));
        String status = firstNonBlank(System.getenv("AI_EXTRACTION_STATUS"), "Invoice");
        String isLink = firstNonBlank(System.getenv("AI_EXTRACTION_IS_LINK"), "false");
        String link = System.getenv("AI_EXTRACTION_LINK");
        if (link != null && invoiceId != null) {
            link = link.replace("{id}", String.valueOf(invoiceId));
        }

        StringBuilder url = new StringBuilder(baseUrl);
        if (baseUrl.indexOf('?') < 0)
            url.append('?');
        else
            url.append('&');
        if (key != null && !key.isBlank())
            url.append("Key=").append(encode(key)).append('&');
        if (session != null && !session.isBlank())
            url.append("sessionID=").append(encode(session)).append('&');
        if (status != null && !status.isBlank())
            url.append("status=").append(encode(status)).append('&');
        if (isLink != null && !isLink.isBlank())
            url.append("isLink=").append(encode(isLink)).append('&');
        if ("true".equalsIgnoreCase(isLink) && link != null && !link.isBlank()) {
            url.append("link=").append(encode(link)).append('&');
        }
        // drop trailing '&' if present
        if (url.charAt(url.length() - 1) == '&')
            url.setLength(url.length() - 1);

        String bearer = firstNonBlank(System.getProperty("ai.extraction.bearer"),
                System.getenv("AI_EXTRACTION_BEARER"));

        // Configure explicit timeouts so the server fails fast instead of hanging
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(10000);
        rf.setReadTimeout(120000);
        RestTemplate restTemplate = new RestTemplate(rf);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new NamedByteArrayResource(pdfBytes, filename == null ? "invoice.pdf" : filename));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        if (bearer != null && !bearer.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + bearer);
        }

        HttpEntity<MultiValueMap<String, Object>> reqEntity = new HttpEntity<>(body, headers);
        ResponseEntity<String> resp = restTemplate.postForEntity(url.toString(), reqEntity, String.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new IllegalStateException("AI extraction service returned status: " + resp.getStatusCode());
        }

        String json = resp.getBody();
        ObjectMapper om = new ObjectMapper();
        try {
            InvoiceRequest parsed = om.readValue(json, InvoiceRequest.class);
            normalizeItems(parsed);
            return parsed;
        } catch (Exception ignore) {
            // fallback to external mapping
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> m = om.readValue(json, Map.class);
            return mapExternalToInternal(m);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to parse AI extraction response", ex);
        }
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank())
            return a;
        if (b != null && !b.isBlank())
            return b;
        return null;
    }

    private static String encode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;

        public NamedByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = filename;
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }

    private static void normalizeItems(InvoiceRequest out) {
        if (out.getItems() != null) {
            for (InvoiceItemRequest it : out.getItems()) {
                if (it.getDiscountPercent() == null)
                    it.setDiscountPercent(0.0);
                if (it.getTaxPercent() == null)
                    it.setTaxPercent(0.0);
                if (it.getWhPercent() == null)
                    it.setWhPercent(0.0);
                if (it.getQuantity() == null)
                    it.setQuantity(1.0);
                if (it.getPrice() == null)
                    it.setPrice(0.0);
            }
        }
    }

    private static InvoiceRequest mapExternalToInternal(Map<String, Object> m) {
        // Some n8n flows wrap the payload as { "output": { ... } }
        Object out = m.get("output");
        if (out instanceof Map<?, ?>) {
            @SuppressWarnings("unchecked")
            Map<String, Object> inner = (Map<String, Object>) out;
            m = inner;
        } else if (out instanceof String s) {
            try {
                m = new ObjectMapper().readValue(s, Map.class);
            } catch (Exception ignore) {
            }
        }

        String invoiceNumber = asString(findAny(m, "invoice_number", "Invoice Number", "InvoiceNumber"));
        String issuanceDate = asString(findAny(m, "issuance_date", "Issuance Date", "date"));
        String issuerName = asString(findAny(m, "issuer_name", "Issuer Name"));
        String recipientName = asString(findAny(m, "recipient_name", "Recipient Name"));
        String account = asString(findAny(m, "account", "Account"));

        Double totalSales = asDouble(findAny(m, "total_sales", "Total Sales"));
        Double totalAmount = asDouble(findAny(m, "total_amount", "Total Amount"));
        Double taxAmt = asDouble(findAny(m, "tax", "TAX"));
        Double whTaxAmt = asDouble(findAny(m, "withholding_tax", "Withholding TAX", "Withholding Tax"));

        // Build internal request
        InvoiceRequest req = new InvoiceRequest();
        String client = (issuerName != null && !issuerName.isBlank()) ? issuerName : recipientName;
        req.setClientName(client);
        req.setInvoiceDate(parseDateFlexible(issuanceDate));
        req.setAmount(firstNonNull(totalAmount, totalSales));

        // Derive percentage values when possible
        Double taxPercent = null;
        if (notNullPositive(taxAmt) && notNullPositive(totalSales)) {
            taxPercent = safePercent(taxAmt, totalSales);
        }
        Double whPercent = null;
        if (notNullPositive(whTaxAmt) && notNullPositive(taxAmt)) {
            whPercent = safePercent(whTaxAmt, taxAmt);
        }

        InvoiceItemRequest line = new InvoiceItemRequest();
        line.setProduct(invoiceNumber != null ? ("Invoice #" + invoiceNumber) : "Invoice Line");
        line.setAccount(account);
        line.setQuantity(1.0);
        // Use Total Sales as the untaxed base when available so computed totals
        // (untaxed, tax, WH, grand total) match the PDF summary rows.
        line.setPrice(firstNonNull(totalSales, totalAmount, 0.0));
        line.setDiscountPercent(0.0);
        line.setTaxPercent(taxPercent != null ? taxPercent : 0.0);
        line.setWhPercent(whPercent != null ? whPercent : 0.0);

        java.util.ArrayList<InvoiceItemRequest> items = new java.util.ArrayList<>();
        items.add(line);
        req.setItems(items);

        normalizeItems(req);
        return req;
    }

    private static String asString(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static Double asDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).doubleValue();
        String s = String.valueOf(o);
        try { return Double.parseDouble(s); } catch (Exception ignore) { }
        try {
            String norm = s.replaceAll("[^0-9.-]", "");
            if (norm.isEmpty() || norm.equals("-") || norm.equals(".")) return null;
            return Double.parseDouble(norm);
        } catch (Exception e) { return null; }
    }

    // Return the first non-null value from list
    private static Double firstNonNull(Double... values) {
        if (values == null)
            return null;
        for (Double v : values) {
            if (v != null)
                return v;
        }
        return null;
    }

    private static boolean notNullPositive(Double v) {
        return v != null && v > 0.0;
    }

    private static Double safePercent(Double part, Double whole) {
        if (whole == null || whole == 0)
            return null;
        double pct = (part / whole) * 100.0;
        if (Double.isFinite(pct) && pct >= 0)
            return pct;
        else
            return null;
    }

    private static Object findAny(Map<String, Object> m, String... keys) {
        if (m == null)
            return null;
        for (String k : keys) {
            if (m.containsKey(k))
                return m.get(k);
        }
        // case-insensitive and normalized key matching
        java.util.Map<String, Object> byLower = new java.util.HashMap<>();
        java.util.Map<String, Object> byNorm = new java.util.HashMap<>();
        for (var e : m.entrySet()) {
            String key = e.getKey();
            byLower.put(key == null ? null : key.toLowerCase(), e.getValue());
            byNorm.put(normalizeKey(key), e.getValue());
        }
        for (String k : keys) {
            Object v = byLower.get(k.toLowerCase());
            if (v != null)
                return v;
            v = byNorm.get(normalizeKey(k));
            if (v != null)
                return v;
        }
        return null;
    }

    private static String normalizeKey(String s) {
        if (s == null)
            return null;
        return s.toLowerCase().replace(" ", "").replace("_", "");
    }

    private static LocalDate parseDateFlexible(String s) {
        if (s == null || s.isBlank())
            return null;
        String[] patterns = new String[] { "dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd" };
        for (String p : patterns) {
            try {
                return LocalDate.parse(s, DateTimeFormatter.ofPattern(p));
            } catch (DateTimeParseException ignore) {
            }
        }
        try {
            return LocalDate.parse(s);
        } catch (Exception ignore) {
        }
        return null;
    }
}
