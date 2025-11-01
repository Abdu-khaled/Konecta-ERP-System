import { Component, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="fixed right-4 top-[calc(var(--navbar-height)+1rem)] z-50 flex flex-col gap-2">
      <div *ngFor="let t of toast.toasts()" [ngClass]="boxClass(t.type)" class="min-w-[280px] max-w-sm rounded-lg px-4 py-2 text-sm shadow-lg">
        {{ t.text }}
      </div>
    </div>
  `
})
export class ToastComponent {
  readonly toast = inject(ToastService);
  boxClass(type: 'success' | 'error' | 'info') {
    switch (type) {
      case 'success': return 'bg-emerald-600 text-white';
      case 'error': return 'bg-rose-600 text-white';
      default: return 'bg-slate-800 text-white';
    }
  }
}

