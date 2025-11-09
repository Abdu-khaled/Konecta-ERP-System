import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryApiService, LowStockResponse } from '../services/inventory.api.service';

@Component({
  selector: 'app-inventory-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="mt-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Low Stock</h1>
    </header>

    <section class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-600">
          <tr>
            <th class="py-2">SKU</th>
            <th>Name</th>
            <th>Qty</th>
            <th>Reorder Level</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of items" class="border-t border-slate-200/70">
            <td class="py-2">{{ i.sku }}</td>
            <td class="text-slate-700">{{ i.name }}</td>
            <td class="text-slate-900">{{ i.quantity | number:'1.0-2' }}</td>
            <td class="text-slate-600">{{ i.reorderLevel | number:'1.0-2' }}</td>
          </tr>
          <tr *ngIf="!items.length">
            <td class="py-4 text-slate-500" colspan="4">No low stock items.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
  `
})
export class LowStockComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  items: LowStockResponse[] = [];

  ngOnInit(): void {
    this.api.listLowStock().subscribe({ next: d => this.items = d || [], error: () => this.items = [] });
  }
}

