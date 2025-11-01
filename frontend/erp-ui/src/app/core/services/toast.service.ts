import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';
export interface Toast { id: number; type: ToastType; text: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _seq = 1;
  readonly toasts = signal<Toast[]>([]);

  private push(type: ToastType, text: string, ttlMs = 2500) {
    const id = this._seq++;
    const t: Toast = { id, type, text };
    this.toasts.update(list => [...list, t]);
    setTimeout(() => this.dismiss(id), ttlMs);
  }
  success(text: string, ttlMs?: number) { this.push('success', text, ttlMs); }
  error(text: string, ttlMs?: number) { this.push('error', text, ttlMs); }
  info(text: string, ttlMs?: number) { this.push('info', text, ttlMs); }
  dismiss(id: number) { this.toasts.update(list => list.filter(x => x.id !== id)); }
}

