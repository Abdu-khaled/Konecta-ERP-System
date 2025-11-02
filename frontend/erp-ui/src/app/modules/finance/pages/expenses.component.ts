import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceApiService } from '../services/finance.api.service';
import { Expense, ExpenseRequest, ExpenseStatus } from '../services/finance.types';
import { AuthState } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { downloadExcel } from '../../../shared/helpers/excel';

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

  // Import UI state
  importOpen = false;
  importFile: File | null = null;
  importStatus: 'APPROVED' | 'PENDING' = 'APPROVED';
  importDateFormat = 'M/d/yyyy';
  importMode: 'upsert' | 'insert_only' = 'upsert';
  importSummary: { inserted: number; updated: number; skipped: number; errors: string[] } | null = null;

  // Pagination state
  page = 1;
  pageSize: 5 | 10 | 20 = 10;

  get totalPages(): number { return Math.max(1, Math.ceil((this.items || []).length / this.pageSize)); }
  get paged(): Expense[] {
    const start = (this.page - 1) * this.pageSize;
    return (this.items || []).slice(start, start + this.pageSize);
  }
  nextPage() { if (this.page < this.totalPages) this.page++; }
  prevPage() { if (this.page > 1) this.page--; }

  ngOnInit(): void { this.refresh(); }
  refresh() {
    this.api.listExpenses(this.filter || undefined).subscribe({
      next: d => { this.items = d; this.page = 1; },
      error: () => this.error = 'Failed to load expenses'
    });
  }
  submit() {
    const uid = (this.state.profile?.id as number | undefined);
    this.model.submittedBy = uid;
    this.api.submitExpense(this.model).subscribe({ next: () => { this.toast.success('Expense submitted'); this.showForm = false; this.model = { submittedBy: uid, category: '', amount: 0, description: '' }; this.refresh(); }, error: () => { this.error = 'Failed to submit expense'; this.toast.error(this.error); } });
  }
  approve(e: Expense) { if (!e.id) return; const uid = (this.state.profile?.id as number | undefined) || 0; this.api.approveExpense(e.id, uid).subscribe({ next: () => { this.toast.success('Expense approved'); this.refresh(); } }); }
  reject(e: Expense) { if (!e.id) return; const uid = (this.state.profile?.id as number | undefined) || 0; this.api.rejectExpense(e.id, uid).subscribe({ next: () => { this.toast.info('Expense rejected'); this.refresh(); } }); }
  download() {
    const cols = [
      { key: 'department', header: 'Department' },
      { key: 'expenseDate', header: 'Expense Date' },
      { key: 'category', header: 'Category' },
      { key: 'amount', header: 'Amount' },
      { key: 'status', header: 'Status' },
      { key: 'description', header: 'Description' }
    ] as any;
    downloadExcel('expenses.xlsx', cols, this.items || []);
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = (input.files && input.files[0]) || null;
    this.importFile = file;
  }
  importNow() {
    if (!this.importFile) { this.toast.error('Choose a file to upload'); return; }
    this.importSummary = null;
    this.api.importExpenses(this.importFile).subscribe({
      next: (s) => {
        this.importSummary = s;
        this.toast.success(`Imported: ${s.inserted} inserted, ${s.updated} updated, ${s.skipped} skipped`);
        // Show all so newly imported APPROVED rows are visible
        this.filter = '' as any;
        this.refresh();
      },
      error: () => { this.toast.error('Import failed'); }
    });
  }
}




