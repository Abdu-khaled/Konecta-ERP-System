import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryApiService, Warehouse } from '../services/inventory.api.service';

@Component({
  selector: 'app-inventory-warehouses',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="mt-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Warehouses</h1>
    </header>

    <section class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-600">
          <tr>
            <th class="py-2">Name</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let w of items" class="border-t border-slate-200/70">
            <td class="py-2">{{ w.name }}</td>
            <td class="text-slate-700">{{ w.location || '-' }}</td>
          </tr>
          <tr *ngIf="!items.length">
            <td class="py-4 text-slate-500" colspan="2">No warehouses.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
  `
})
export class WarehousesComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  items: Warehouse[] = [];

  ngOnInit(): void {
    this.api.listWarehouses().subscribe({ next: d => this.items = d || [], error: () => this.items = [] });
  }
}

