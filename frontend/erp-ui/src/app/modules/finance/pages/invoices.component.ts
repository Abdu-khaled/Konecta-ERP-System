import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceApiService } from '../services/finance.api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Invoice, InvoiceRequest, InvoiceStatus } from '../services/finance.types';
import { downloadExcel } from '../../../shared/helpers/excel';

@Component({
  selector: 'app-finance-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html'
})
export class InvoicesComponent implements OnInit {
  private readonly api = inject(FinanceApiService);
  private readonly toast = inject(ToastService);
  items: Invoice[] = [];
  error = '';
  showForm = false;
  model: InvoiceRequest = { clientName: '', invoiceDate: '', amount: 0 };
  filter: InvoiceStatus | '' = '';

  ngOnInit(): void { this.refresh(); }
  refresh() {
    this.api.listInvoices(this.filter || undefined).subscribe({ next: d => this.items = d, error: () => this.error = 'Failed to load invoices' });
  }
  submit() {
    this.api.createInvoice(this.model).subscribe({ next: () => { this.toast.success('Invoice created'); this.showForm = false; this.model = { clientName: '', invoiceDate: '', amount: 0 }; this.refresh(); }, error: () => { this.error = 'Failed to create invoice'; this.toast.error(this.error); } });
  }
  send(i: Invoice) { if (!i.id) return; this.api.sendInvoice(i.id).subscribe({ next: () => { this.toast.success('Invoice sent'); this.refresh(); } }); }
  markPaid(i: Invoice) { if (!i.id) return; this.api.markInvoicePaid(i.id).subscribe({ next: () => { this.toast.success('Invoice marked paid'); this.refresh(); } }); }
  download() {
    const cols = [
      { key: 'clientName', header: 'Client' },
      { key: 'invoiceDate', header: 'Date' },
      { key: 'amount', header: 'Amount' },
      { key: 'status', header: 'Status' }
    ] as any;
    downloadExcel('invoices.xlsx', cols, this.items || []);
  }
}





