package gateway_service.gateway_service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.Enumeration;

@RestController
@RequestMapping("/api")
public class ProxyController {

    private final RestTemplate restTemplate;
    private static final Logger log = LoggerFactory.getLogger(ProxyController.class);

    public ProxyController(RestTemplateBuilder builder) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(30000);
        this.restTemplate = builder.requestFactory(() -> factory).build();
    }

    @RequestMapping(path = "/auth/**")
    public ResponseEntity<byte[]> proxyAuth(HttpMethod method,
                                            HttpServletRequest request,
                                            @RequestBody(required = false) byte[] body) {
        String upstreamBase = "http://auth-service:8081/api/auth";
        return forward(upstreamBase, method, request, body);
    }

    @RequestMapping(path = "/hr/**")
    public ResponseEntity<byte[]> proxyHr(HttpMethod method,
                                          HttpServletRequest request,
                                          @RequestBody(required = false) byte[] body) {
        String upstreamBase = "http://hr-service:8082/api/hr";
        return forward(upstreamBase, method, request, body);
    }

    @RequestMapping(path = "/finance/**")
    public ResponseEntity<byte[]> proxyFinance(HttpMethod method,
                                               HttpServletRequest request,
                                               @RequestBody(required = false) byte[] body) {
        String upstreamBase = "http://finance-service:8083/api/finance";
        return forward(upstreamBase, method, request, body);
    }


    @RequestMapping(path = "/reporting/**")
    public ResponseEntity<byte[]> proxyReporting(HttpMethod method,
                                                 HttpServletRequest request,
                                                 @RequestBody(required = false) byte[] body) {
        String upstreamBase = "http://reporting-service:8080/api/reporting";
        return forward(upstreamBase, method, request, body);
    }

    private ResponseEntity<byte[]> forward(String upstreamBase,
                                           HttpMethod method,
                                           HttpServletRequest request,
                                           byte[] body) {
        String fullPath = request.getRequestURI(); // e.g. /api/auth/login
        String prefix = "/api";
        String suffix = fullPath.startsWith(prefix) ? fullPath.substring(prefix.length()) : fullPath; // /auth/login
        String query = request.getQueryString();
        String target = upstreamBase + suffix.replaceFirst("^/auth", "") + (query != null ? "?" + query : "");

        HttpHeaders headers = extractHeaders(request);
        // Remove hop-by-hop headers
        headers.remove(HttpHeaders.HOST);
        headers.remove(HttpHeaders.CONTENT_LENGTH);
        headers.remove(HttpHeaders.ACCEPT_ENCODING);

        HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);
        String fullUrl = fullPath + (query != null ? ("?" + query) : "");
        log.info("Proxy {} {} -> {}", method, fullUrl, target);
        ResponseEntity<byte[]> resp = restTemplate.exchange(URI.create(target), method, entity, byte[].class);

        HttpHeaders out = new HttpHeaders();
        out.putAll(resp.getHeaders());
        out.remove(HttpHeaders.TRANSFER_ENCODING);
        out.remove(HttpHeaders.CONTENT_LENGTH);
        return new ResponseEntity<>(resp.getBody(), out, resp.getStatusCode());
    }

    private static HttpHeaders extractHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        for (Enumeration<String> names = request.getHeaderNames(); names != null && names.hasMoreElements();) {
            String name = names.nextElement();
            for (Enumeration<String> values = request.getHeaders(name); values.hasMoreElements();) {
                headers.add(name, values.nextElement());
            }
        }
        return headers;
    }
}
