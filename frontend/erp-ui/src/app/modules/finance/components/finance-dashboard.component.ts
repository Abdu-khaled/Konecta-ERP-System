import { Component } from '@angular/core';
import { ChatbotWidgetComponent } from '../../../shared/components/chatbot/chatbot-widget.component';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  templateUrl: './finance-dashboard.component.html',
  imports: [ChatbotWidgetComponent]
})
export class FinanceDashboardComponent {}
