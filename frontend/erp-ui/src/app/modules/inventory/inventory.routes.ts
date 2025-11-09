import { Routes } from '@angular/router';
import { InventoryDashboardComponent } from './components/inventory-dashboard.component';
import { ItemsComponent } from './pages/items.component';
import { LowStockComponent } from './pages/low-stock.component';
import { MovementsComponent } from './pages/movements.component';
import { WarehousesComponent } from './pages/warehouses.component';

export const inventoryRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: InventoryDashboardComponent },
  { path: 'items', component: ItemsComponent },
  { path: 'low-stock', component: LowStockComponent },
  { path: 'movements', component: MovementsComponent },
  { path: 'warehouses', component: WarehousesComponent },
];

