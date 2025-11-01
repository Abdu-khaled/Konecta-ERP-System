import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceApiService } from '../services/finance.api.service';
import { Expense, ExpenseRequest, ExpenseStatus } from '../services/finance.types';
import { AuthState } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-finance-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expenses.component.html'
})
export class ExpensesComponent implements OnInit {
  private readonly api = inject(FinanceApiService);
  private readonly state = inject(AuthState);
  private readonly toast = inject(ToastService);
  items: Expense[] = [];
  error = '';
  showForm = false;
  filter: ExpenseStatus | '' = 'PENDING';
  model: ExpenseRequest = { submittedBy: undefined, category: '', amount: 0, description: '' };

  ngOnInit(): void { this.refresh(); }
  refresh() { this.api.listExpenses(this.filter || undefined).subscribe({ next: d => this.items = d, error: () => this.error = 'Failed to load expenses' }); }
  submit() {
    const uid = (this.state.profile?.id as number | undefined);
    this.model.submittedBy = uid;
    this.api.submitExpense(this.model).subscribe({ next: () => { this.toast.success('Expense submitted'); this.showForm = false; this.model = { submittedBy: uid, category: '', amount: 0, description: '' }; this.refresh(); }, error: () => { this.error = 'Failed to submit expense'; this.toast.error(this.error); } });
  }
  approve(e: Expense) { if (!e.id) return; const uid = (this.state.profile?.id as number | undefined) || 0; this.api.approveExpense(e.id, uid).subscribe({ next: () => { this.toast.success('Expense approved'); this.refresh(); } }); }
  reject(e: Expense) { if (!e.id) return; const uid = (this.state.profile?.id as number | undefined) || 0; this.api.rejectExpense(e.id, uid).subscribe({ next: () => { this.toast.info('Expense rejected'); this.refresh(); } }); }
}
