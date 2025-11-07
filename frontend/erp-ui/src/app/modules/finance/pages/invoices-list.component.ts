import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FinanceApiService } from '../services/finance.api.service';
import { FinanceInvoiceApiService } from '../services/finance.invoice.api.service';
import { Invoice } from '../services/finance.types';

@Component({
  selector: 'app-finance-invoices-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="mt-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Invoices</h1>
      <div class="flex items-center gap-2">
        <button class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700" [routerLink]="['/finance/invoices/new']">New Invoice</button>
      </div>
    </header>

    <section class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-600">
          <tr>
            <th class="py-2">Vendor</th>
            <th>Date</th>
            <th>Untaxed</th>
            <th>Tax (after WH)</th>
            <th>Total</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of items" class="border-t border-slate-200/70">
            <td class="py-2">{{ i.clientName }}</td>
            <td class="text-slate-600">{{ i.invoiceDate }}</td>
            <td class="text-slate-600">{{ (i.untaxedTotal ?? 0) | number:'1.2-2' }}</td>
            <td class="text-slate-600">{{ ((i.taxTotal ?? 0) - (i.withholdingTotal ?? 0)) | number:'1.2-2' }}</td>
            <td class="text-slate-900">{{ (i.grandTotal ?? i.amount ?? 0) | number:'1.2-2' }}</td>
            <td class="text-slate-600">{{ i.status }}</td>
            <td class="text-right">
              <button class="text-indigo-600 mr-3" [routerLink]="['/finance/invoices/new']" [queryParams]="{ id: i.id }">Open</button>
              <button class="text-slate-700" (click)="downloadPdf(i)" [disabled]="!i.pdfAttached">Download PDF</button>
            </td>
          </tr>
          <tr *ngIf="!items.length">
            <td class="py-4 text-slate-500" colspan="7">No invoices yet.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
  `
})
export class InvoicesListComponent implements OnInit {
  private readonly api = inject(FinanceApiService);
  private readonly invApi = inject(FinanceInvoiceApiService);
  private readonly router = inject(Router);

  items: Invoice[] = [];

  ngOnInit(): void {
    this.api.listInvoices().subscribe({ next: d => this.items = d || [], error: () => this.items = [] });
  }

  downloadPdf(i: Invoice) {
    if (!i.id) return;
    this.invApi.downloadPdf(i.id).subscribe({ next: blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `invoice-${i.id}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } });
  }
}

