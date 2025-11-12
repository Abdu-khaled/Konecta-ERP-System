package finance_service.finance_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class FinanceServiceApplicationTests {

	@Test
	void contextLoads() {
        org.junit.jupiter.api.Assertions.assertTrue(true);
	}

}
