import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryApiService, InventoryItem, StockLevelResponse } from '../services/inventory.api.service';

@Component({
  selector: 'app-inventory-items',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="mt-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Items</h1>
      <div class="flex items-center gap-2">
        <!-- Placeholder for future create item -->
      </div>
    </header>

    <section class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-600">
          <tr>
            <th class="py-2">SKU</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Reorder</th>
            <th>On Hand</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of items" class="border-t border-slate-200/70">
            <td class="py-2">{{ i.sku }}</td>
            <td class="text-slate-700">{{ i.name }}</td>
            <td class="text-slate-600">{{ i.unit || '-' }}</td>
            <td class="text-slate-600">{{ i.reorderLevel ?? 0 }}</td>
            <td class="text-slate-900">{{ (stocks[i.id || -1]?.quantity ?? 0) | number:'1.0-2' }}</td>
          </tr>
          <tr *ngIf="!items.length">
            <td class="py-4 text-slate-500" colspan="5">No items found.</td>
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

  ngOnInit(): void {
    this.api.listItems().subscribe({
      next: d => {
        this.items = d || [];
        this.fetchStocks();
      },
      error: () => this.items = []
    });
  }

  private fetchStocks() {
    const ids = (this.items || []).map(i => i.id).filter((x): x is number => typeof x === 'number');
    ids.forEach(id => this.api.getStock(id).subscribe({ next: s => this.stocks[id] = s }));
  }
}

