import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryApiService, MovementRequest, MovementResponse } from '../services/inventory.api.service';

@Component({
  selector: 'app-inventory-movements',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="mt-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Movements</h1>
    </header>

    <section class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <table class="w-full text-sm">
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

  ngOnInit(): void {
    this.api.listMovements().subscribe({ next: d => this.items = d || [], error: () => this.items = [] });
  }
}

