import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export const INVENTORY_API_BASE_URL = new InjectionToken<string>('INVENTORY_API_BASE_URL');

export interface InventoryItem {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  unit?: string;
  reorderLevel?: number;
}

export interface Warehouse {
  id?: number;
  name: string;
  location?: string;
}

export interface MovementRequest {
  itemId: number;
  warehouseId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reference?: string;
}

export interface MovementResponse {
  id: number;
  itemId: number;
  warehouseId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reference?: string;
  createdAt?: string;
}

export interface StockLevelResponse {
  itemId: number;
  warehouseId?: number | null;
  quantity: number;
}

export interface LowStockResponse {
  itemId: number;
  sku: string;
  name: string;
  quantity: number;
  reorderLevel: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(INVENTORY_API_BASE_URL);

  // Items
  listItems(): Observable<InventoryItem[]> { return this.http.get<InventoryItem[]>(`${this.base}/items`); }
  getItem(id: number): Observable<InventoryItem> { return this.http.get<InventoryItem>(`${this.base}/items/${id}`); }
  createItem(payload: InventoryItem): Observable<InventoryItem> { return this.http.post<InventoryItem>(`${this.base}/items`, payload); }
  updateItem(id: number, payload: InventoryItem): Observable<InventoryItem> { return this.http.put<InventoryItem>(`${this.base}/items/${id}`, payload); }
  deleteItem(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/items/${id}`); }

  // Warehouses
  listWarehouses(): Observable<Warehouse[]> { return this.http.get<Warehouse[]>(`${this.base}/warehouses`); }

  // Stock & Movements
  getStock(itemId: number, warehouseId?: number): Observable<StockLevelResponse> {
    let params = new HttpParams().set('itemId', String(itemId));
    if (warehouseId != null) params = params.set('warehouseId', String(warehouseId));
    return this.http.get<StockLevelResponse>(`${this.base}/stock`, { params });
  }
  listMovements(): Observable<MovementResponse[]> { return this.http.get<MovementResponse[]>(`${this.base}/movements`); }
  createMovement(payload: MovementRequest): Observable<MovementResponse> { return this.http.post<MovementResponse>(`${this.base}/movements`, payload); }
  listLowStock(): Observable<LowStockResponse[]> { return this.http.get<LowStockResponse[]>(`${this.base}/low-stock`); }
}

