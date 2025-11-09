import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryApiService, LowStockResponse, MovementResponse } from '../services/inventory.api.service';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="mt-6 space-y-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Inventory Dashboard</h1>
      <nav class="flex items-center gap-2 text-sm">
        <a class="text-indigo-600 hover:underline" [routerLink]="['/inventory/items']">Items</a>
        <span class="text-slate-400">/</span>
        <a class="text-indigo-600 hover:underline" [routerLink]="['/inventory/low-stock']">Low Stock</a>
        <span class="text-slate-400">/</span>
        <a class="text-indigo-600 hover:underline" [routerLink]="['/inventory/movements']">Movements</a>
      </nav>
    </header>

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Low Stock</h2>
          <a class="text-sm text-indigo-600" [routerLink]="['/inventory/low-stock']">View all</a>
        </div>
        <div class="mt-2">
          <table class="w-full text-sm">
            <thead class="text-left text-slate-600">
              <tr>
                <th class="py-2">SKU</th>
                <th>Name</th>
                <th>Qty</th>
                <th>Reorder</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of lowStock | slice:0:5" class="border-t border-slate-200/70">
                <td class="py-2">{{ i.sku }}</td>
                <td class="text-slate-700">{{ i.name }}</td>
                <td class="text-slate-900">{{ i.quantity | number:'1.0-2' }}</td>
                <td class="text-slate-600">{{ i.reorderLevel | number:'1.0-2' }}</td>
              </tr>
              <tr *ngIf="!lowStock.length">
                <td class="py-4 text-slate-500" colspan="4">No items at or below reorder level.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Recent Movements</h2>
          <a class="text-sm text-indigo-600" [routerLink]="['/inventory/movements']">View all</a>
        </div>
        <div class="mt-2">
          <table class="w-full text-sm">
            <thead class="text-left text-slate-600">
              <tr>
                <th class="py-2">Type</th>
                <th>Item ID</th>
                <th>Warehouse</th>
                <th>Qty</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of movements | slice:0:5" class="border-t border-slate-200/70">
                <td class="py-2"><span class="rounded px-2 py-0.5 text-xs" [ngClass]="m.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">{{ m.type }}</span></td>
                <td class="text-slate-700">{{ m.itemId }}</td>
                <td class="text-slate-700">{{ m.warehouseId }}</td>
                <td class="text-slate-900">{{ m.quantity | number:'1.0-2' }}</td>
                <td class="text-slate-600">{{ m.createdAt || '-' }}</td>
              </tr>
              <tr *ngIf="!movements.length">
                <td class="py-4 text-slate-500" colspan="5">No movements recorded.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
  `
})
export class InventoryDashboardComponent implements OnInit {
  private readonly api = inject(InventoryApiService);

  lowStock: LowStockResponse[] = [];
  movements: MovementResponse[] = [];

  ngOnInit(): void {
    this.api.listLowStock().subscribe({ next: d => this.lowStock = d || [], error: () => this.lowStock = [] });
    this.api.listMovements().subscribe({ next: d => this.movements = d || [], error: () => this.movements = [] });
  }
}

