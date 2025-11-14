import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryApiService, InventoryItem, MovementRequest, MovementResponse, Warehouse } from '../services/inventory.api.service';

@Component({
  selector: 'app-inventory-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="mt-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Movements</h1>
      <div class="flex items-center gap-2">
        <button type="button"
                class="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                (click)="showCreate = !showCreate">
          {{ showCreate ? 'Close' : 'Record Movement' }}
        </button>
      </div>
    </header>

    <section *ngIf="showCreate" class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <form (ngSubmit)="create()" class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Item</span>
          <select class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" name="itemId" [(ngModel)]="form.itemId" required>
            <option [ngValue]="null">Select item…</option>
            <option *ngFor="let i of itemsList" [ngValue]="i.id">{{ i.sku }} — {{ i.name }}</option>
          </select>
        </label>
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Warehouse</span>
          <select class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" name="warehouseId" [(ngModel)]="form.warehouseId" required>
            <option [ngValue]="null">Select warehouse…</option>
            <option *ngFor="let w of warehouses" [ngValue]="w.id">{{ w.name }}</option>
          </select>
        </label>
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Type</span>
          <select class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" name="type" [(ngModel)]="form.type" required>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
        </label>
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Quantity</span>
          <input type="number" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" min="0.01" step="0.01" name="quantity" [(ngModel)]="form.quantity" required />
        </label>
        <label class="md:col-span-2 text-sm">
          <span class="block text-slate-600 mb-1">Reference</span>
          <input class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" name="reference" [(ngModel)]="form.reference" placeholder="PO-123, ADJ-001, etc." />
        </label>
        <div class="md:col-span-3 flex items-center gap-2">
          <button class="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700" type="submit">Save</button>
          <span class="text-sm text-rose-600" *ngIf="error">{{ error }}</span>
        </div>
      </form>
    </section>

    <section class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <table class="k-table w-full text-sm">
        <thead class="text-left text-slate-600">
          <tr>
            <th class="py-2">Type</th>
            <th>Item ID</th>
            <th>Warehouse</th>
            <th>Qty</th>
            <th>Reference</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of items" class="border-t border-slate-200/70">
            <td class="py-2"><span class="rounded px-2 py-0.5 text-xs" [ngClass]="m.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">{{ m.type }}</span></td>
            <td class="text-slate-700">{{ m.itemId }}</td>
            <td class="text-slate-700">{{ m.warehouseId }}</td>
            <td class="text-slate-900">{{ m.quantity | number:'1.0-2' }}</td>
            <td class="text-slate-600">{{ m.reference || '-' }}</td>
            <td class="text-slate-600">{{ m.createdAt || '-' }}</td>
          </tr>
          <tr *ngIf="!items.length">
            <td class="py-4 text-slate-500" colspan="6">No movements.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
  `
})
export class MovementsComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  items: MovementResponse[] = [];
  itemsList: InventoryItem[] = [];
  warehouses: Warehouse[] = [];
  showCreate = false;
  error: string | null = null;
  form: { itemId: number | null; warehouseId: number | null; type: 'IN' | 'OUT'; quantity: number | null; reference?: string } = {
    itemId: null,
    warehouseId: null,
    type: 'IN',
    quantity: null,
    reference: ''
  };

  ngOnInit(): void {
    this.api.listMovements().subscribe({ next: d => this.items = d || [], error: () => this.items = [] });
    this.api.listItems().subscribe({ next: d => this.itemsList = d || [] });
    this.api.listWarehouses().subscribe({ next: d => this.warehouses = d || [] });
  }

  create() {
    this.error = null;
    const payload: MovementRequest = {
      itemId: this.form.itemId as number,
      warehouseId: this.form.warehouseId as number,
      type: this.form.type,
      quantity: Number(this.form.quantity || 0),
      reference: (this.form.reference || undefined)?.toString().trim() || undefined
    };
    if (!payload.itemId || !payload.warehouseId || !payload.quantity || payload.quantity <= 0) {
      this.error = 'Item, Warehouse and positive Quantity are required';
      return;
    }
    this.api.createMovement(payload).subscribe({
      next: m => {
        this.items = [m, ...this.items];
        this.showCreate = false;
        this.form = { itemId: null, warehouseId: null, type: 'IN', quantity: null, reference: '' };
      },
      error: (e) => this.error = (e?.error?.message as string) || 'Failed to record movement'
    });
  }
}
