import { Component, computed, inject, signal } from '@angular/core';
import { AuthState } from '../../../core/services/auth-state.service';
import { ChatbotWidgetComponent } from '../../../shared/components/chatbot/chatbot-widget.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  templateUrl: './employee-dashboard.component.html',
  imports: [ChatbotWidgetComponent]
})
export class EmployeeDashboardComponent {
  private readonly state = inject(AuthState);
  firstName = computed(() => {
    const u = this.state.profile;
    const name = (u?.username || '').trim();
    if (!name) return 'Employee';
    return name.split(' ')[0];
  });
}
