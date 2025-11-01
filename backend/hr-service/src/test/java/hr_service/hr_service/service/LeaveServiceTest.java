package hr_service.hr_service.service;

import hr_service.hr_service.model.LeaveRequest;
import hr_service.hr_service.model.LeaveStatus;
import hr_service.hr_service.repository.EmployeeRepository;
import hr_service.hr_service.repository.LeaveRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;
    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private LeaveService leaveService;

    @Test
    void create_setsPending() {
        when(leaveRequestRepository.save(any(LeaveRequest.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        LeaveRequest req = new LeaveRequest();
        LeaveRequest saved = leaveService.create(req);
        assertThat(saved.getStatus()).isEqualTo(LeaveStatus.PENDING);
    }

    @Test
    void approve_movesToApproved() {
        LeaveRequest r = new LeaveRequest();
        r.setId(10L);
        when(leaveRequestRepository.findById(10L)).thenReturn(Optional.of(r));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        LeaveRequest saved = leaveService.approve(10L);
        assertThat(saved.getStatus()).isEqualTo(LeaveStatus.APPROVED);
    }

    @Test
    void reject_movesToRejected() {
        LeaveRequest r = new LeaveRequest();
        r.setId(11L);
        when(leaveRequestRepository.findById(11L)).thenReturn(Optional.of(r));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        LeaveRequest saved = leaveService.reject(11L);
        assertThat(saved.getStatus()).isEqualTo(LeaveStatus.REJECTED);
    }
}
