import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceApiService } from '../services/finance.api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Invoice, InvoiceItem, InvoiceRequest, InvoiceStatus } from '../services/finance.types';
import { downloadExcel } from '../../../shared/helpers/excel';
import { FinanceInvoiceApiService } from '../services/finance.invoice.api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-finance-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html'
})
export class InvoicesComponent implements OnInit {
  private readonly api = inject(FinanceApiService);
  private readonly invApi = inject(FinanceInvoiceApiService);
  private readonly toast = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);
  items: Invoice[] = [];
  error = '';
  model: InvoiceRequest = { clientName: '', invoiceDate: '', items: [] };
  pdfPreviewUrl: SafeResourceUrl | null = null;
  private selectedPdf: File | null = null;
  lastCreated: Invoice | null = null;
  filter: InvoiceStatus | '' = '';

  ngOnInit(): void { this.resetModel(); this.addLine(); this.refresh(); }
  refresh() {
    this.api.listInvoices(this.filter || undefined).subscribe({ next: d => this.items = d, error: () => this.error = 'Failed to load invoices' });
  }
  submit() {
    const updating = !!this.lastCreated?.id;
    const op = updating ? this.invApi.update(this.lastCreated!.id!, this.model) : this.invApi.create(this.model);
    op.subscribe({
      next: (i) => {
        this.lastCreated = i;
        this.toast.success(updating ? 'Invoice updated' : 'Invoice created');
        if (this.selectedPdf && i.id) {
          this.invApi.uploadPdf(i.id, this.selectedPdf).subscribe({ next: () => { this.loadPdfPreview(i.id!); }, error: () => this.toast.error('Failed to upload PDF') });
        }
        this.refresh();
      },
      error: () => { this.error = updating ? 'Failed to update invoice' : 'Failed to create invoice'; this.toast.error(this.error); }
    });
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

  // Lines UI helpers
  addLine() {
    const line: InvoiceItem = { product: '', account: '', dueDate: '', quantity: 1, price: 0, discountPercent: 0, taxPercent: 0, whPercent: 0 };
    (this.model.items ||= []).push(line);
  }
  removeLine(ix: number) { (this.model.items ||= []).splice(ix, 1); }
  calcLineAmount(l: InvoiceItem): number {
    const qty = Number(l.quantity||0), price = Number(l.price||0), disc = Number(l.discountPercent||0), tax = Number(l.taxPercent||0), wh = Number(l.whPercent||0);
    const base = qty*price*(1-disc/100);
    const taxAmt = base*tax/100;
    const whAmt = taxAmt*wh/100; // WH reduces tax by a percentage of the tax
    return Math.max(0, base + taxAmt - whAmt);
  }
  totalUntaxed(): number { return (this.model.items||[]).reduce((s,l)=> s + Number(l.quantity||0)*Number(l.price||0)*(1-Number(l.discountPercent||0)/100), 0); }
  totalTax(): number { return (this.model.items||[]).reduce((s,l)=> { const base = Number(l.quantity||0)*Number(l.price||0)*(1-Number(l.discountPercent||0)/100); return s + base*(Number(l.taxPercent||0)/100); }, 0); }
  totalWH(): number { return (this.model.items||[]).reduce((s,l)=> { const base = Number(l.quantity||0)*Number(l.price||0)*(1-Number(l.discountPercent||0)/100); const taxAmt = base*(Number(l.taxPercent||0)/100); return s + taxAmt*(Number(l.whPercent||0)/100); }, 0); }
  grandTotal(): number { return this.totalUntaxed() + this.totalTax() - this.totalWH(); }

  resetModel() { this.model = { clientName: '', invoiceDate: '', items: [] }; this.selectedPdf = null; this.pdfPreviewUrl = null; this.lastCreated = null; }
  onPdfSelected(evt: any) {
    const file: File | undefined = evt?.target?.files?.[0];
    if (!file) return; this.selectedPdf = file; const url = URL.createObjectURL(file); this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  loadPdfPreview(id: number) {
    this.invApi.downloadPdf(id).subscribe({ next: blob => { const url = URL.createObjectURL(blob); this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url); }, error: () => this.toast.error('Failed to load PDF') });
  }
}





