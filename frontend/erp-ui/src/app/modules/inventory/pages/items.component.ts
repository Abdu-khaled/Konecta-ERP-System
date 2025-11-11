import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryApiService, InventoryItem, StockLevelResponse, Warehouse } from '../services/inventory.api.service';

@Component({
  selector: 'app-inventory-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="mt-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Items</h1>
      <div class="flex items-center gap-2">
        <button type="button"
                class="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                (click)="showCreate = !showCreate">
          {{ showCreate ? 'Close' : 'Add Item' }}
        </button>
      </div>
    </header>

    <section *ngIf="showCreate" class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <form (ngSubmit)="create()" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">SKU</span>
          <input class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                 name="sku" [(ngModel)]="newItem.sku" required />
        </label>
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Name</span>
          <input class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                 name="name" [(ngModel)]="newItem.name" required />
        </label>
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Unit</span>
          <input class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                 name="unit" [(ngModel)]="newItem.unit" placeholder="pcs" />
        </label>
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Reorder Level</span>
          <input type="number" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                 name="reorderLevel" [(ngModel)]="newItem.reorderLevel" min="0" />
        </label>
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Initial Quantity</span>
          <input type="number" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" min="0" step="0.01"
                 name="initialQuantity" [(ngModel)]="initialQuantity" />
        </label>
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Warehouse (for initial qty)</span>
          <select class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" name="warehouseId" [(ngModel)]="selectedWarehouseId">
            <option [ngValue]="null">Select…</option>
            <option *ngFor="let w of warehouses" [ngValue]="w.id">{{ w.name }}</option>
          </select>
        </label>
        <label class="sm:col-span-2 text-sm">
          <span class="block text-slate-600 mb-1">Description</span>
          <input class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                 name="description" [(ngModel)]="newItem.description" />
        </label>
        <div class="sm:col-span-2 flex items-center gap-2">
          <button class="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700" type="submit">Save</button>
          <button class="rounded-full bg-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-300" type="button" (click)="resetForm()">Reset</button>
          <span class="text-sm text-rose-600" *ngIf="error">{{ error }}</span>
        </div>
      </form>
    </section>

    <section class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-600">
          <tr>
            <th class="py-2">SKU</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Reorder</th>
            <th>On Hand</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of items" class="border-t border-slate-200/70">
            <td class="py-2">{{ i.sku }}</td>
            <td class="text-slate-700">{{ i.name }}</td>
            <td class="text-slate-600">{{ i.unit || '-' }}</td>
            <td class="text-slate-600">{{ i.reorderLevel ?? 0 }}</td>
            <td class="text-slate-900">{{ (i.quantity ?? stocks[i.id || -1]?.quantity ?? 0) | number:'1.0-2' }}</td>
            <td class="text-right">
              <button class="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                      (click)="remove(i)"
                      title="Delete Item">
                Delete
              </button>
            </td>
          </tr>
          <tr *ngIf="!items.length">
            <td class="py-4 text-slate-500" colspan="6">No items found.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
  `
})
export class ItemsComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  items: InventoryItem[] = [];
  stocks: Record<number, StockLevelResponse> = {};
  showCreate = false;
  error: string | null = null;
  newItem: InventoryItem = { sku: '', name: '', unit: '', reorderLevel: 0, description: '' };
  warehouses: Warehouse[] = [];
  selectedWarehouseId: number | null = null;
  initialQuantity: number | null = null;

  ngOnInit(): void {
    this.api.listItems().subscribe({
      next: d => {
        this.items = d || [];
        this.fetchStocks();
      },
      error: () => this.items = []
    });
    this.api.listWarehouses().subscribe({ next: d => this.warehouses = d || [] });
  }

  private fetchStocks() {
    const ids = (this.items || []).map(i => i.id).filter((x): x is number => typeof x === 'number');
    ids.forEach(id => this.api.getStock(id).subscribe({ next: s => this.stocks[id] = s }));
  }

  create() {
    this.error = null;
    const payload: InventoryItem = {
      sku: (this.newItem.sku || '').trim(),
      name: (this.newItem.name || '').trim(),
      unit: (this.newItem.unit || undefined)?.toString().trim() || undefined,
      reorderLevel: this.newItem.reorderLevel ?? 0,
      description: (this.newItem.description || undefined)?.toString().trim() || undefined,
      initialQuantity: this.initialQuantity != null && this.initialQuantity > 0 ? this.initialQuantity : undefined,
      warehouseId: this.selectedWarehouseId != null ? this.selectedWarehouseId : undefined
    };
    if (!payload.sku || !payload.name) {
      this.error = 'SKU and Name are required';
      return;
    }
    this.api.createItem(payload).subscribe({
      next: (created) => {
        this.items = [created, ...this.items];
        if (created.id != null) {
          this.api.getStock(created.id).subscribe({ next: s => this.stocks[created.id!] = s });
        }
        this.resetForm();
        this.showCreate = false;
      },
      error: (e) => {
        this.error = (e?.error?.message as string) || 'Failed to create item';
      }
    });
  }

  remove(i: InventoryItem) {
    if (!i.id) return;
    const ok = confirm(`Delete item ${i.sku} - ${i.name}?`);
    if (!ok) return;
    this.api.deleteItem(i.id).subscribe({
      next: () => {
        this.items = this.items.filter(x => x.id !== i.id);
        if (i.id != null) delete this.stocks[i.id];
      }
    });
  }

  resetForm() {
    this.newItem = { sku: '', name: '', unit: '', reorderLevel: 0, description: '' };
    this.initialQuantity = null;
    this.selectedWarehouseId = null;
    this.error = null;
  }
}
