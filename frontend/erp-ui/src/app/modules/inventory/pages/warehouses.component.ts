import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryApiService, Warehouse } from '../services/inventory.api.service';

@Component({
  selector: 'app-inventory-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="mt-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Warehouses</h1>
      <div class="flex items-center gap-2">
        <button type="button"
                class="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                (click)="showCreate = !showCreate">
          {{ showCreate ? 'Close' : 'Add Warehouse' }}
        </button>
      </div>
    </header>

    <section *ngIf="showCreate" class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <form (ngSubmit)="create()" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Name</span>
          <input class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                 name="name" [(ngModel)]="newWarehouse.name" required />
        </label>
        <label class="text-sm">
          <span class="block text-slate-600 mb-1">Location</span>
          <input class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                 name="location" [(ngModel)]="newWarehouse.location" />
        </label>
        <div class="sm:col-span-2 flex items-center gap-2">
          <button class="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700" type="submit">Save</button>
          <button class="rounded-full bg-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-300" type="button" (click)="resetForm()">Reset</button>
          <span class="text-sm text-rose-600" *ngIf="error">{{ error }}</span>
        </div>
      </form>
    </section>

    <section class="mt-4 rounded-2xl bg-white p-4 shadow ring-1 ring-slate-200/70">
      <table class="k-table w-full text-sm">
        <thead class="text-left text-slate-600">
          <tr>
            <th class="py-2">Name</th>
            <th>Location</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let w of items" class="border-t border-slate-200/70">
            <td class="py-2">{{ w.name }}</td>
            <td class="text-slate-700">{{ w.location || '-' }}</td>
            <td class="text-right">
              <button class="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                      (click)="remove(w)"
                      title="Delete Warehouse">
                Delete
              </button>
            </td>
          </tr>
          <tr *ngIf="!items.length">
            <td class="py-4 text-slate-500" colspan="3">No warehouses.</td>
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
  showCreate = false;
  newWarehouse: Warehouse = { name: '', location: '' };
  error: string | null = null;

  ngOnInit(): void {
    this.api.listWarehouses().subscribe({ next: d => this.items = d || [], error: () => this.items = [] });
  }

  create() {
    this.error = null;
    const payload: Warehouse = { name: (this.newWarehouse.name || '').trim(), location: (this.newWarehouse.location || undefined)?.toString().trim() || undefined };
    if (!payload.name) { this.error = 'Name is required'; return; }
    this.api.createWarehouse(payload).subscribe({
      next: w => {
        this.items = [w, ...this.items];
        this.resetForm();
        this.showCreate = false;
      },
      error: (e) => this.error = (e?.error?.message as string) || 'Failed to create warehouse'
    });
  }

  remove(w: Warehouse) {
    if (!w.id) return;
    const ok = confirm(`Delete warehouse ${w.name}?`);
    if (!ok) return;
    this.api.deleteWarehouse(w.id).subscribe({
      next: () => this.items = this.items.filter(x => x.id !== w.id)
    });
  }

  resetForm() {
    this.newWarehouse = { name: '', location: '' };
    this.error = null;
  }
}
