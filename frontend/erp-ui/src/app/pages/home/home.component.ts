import { Component } from '@angular/core';
import { DecimalPipe, NgClass, NgFor } from '@angular/common';
import { useHome } from './home.hook';

type Trend = 'up' | 'down' | 'flat';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgClass, DecimalPipe],
  template: `
    <section class="flex flex-col gap-7 py-4">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p class="text-sm text-slate-500">Snapshot of today's performance across key business areas.</p>
        </div>

        <button type="button" class="inline-flex items-center justify-center self-start rounded-full border border-indigo-600 bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:self-center" (click)="vm.refresh()">
          Refresh data
        </button>
      </header>

      <section class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article class="flex flex-col gap-3 rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-slate-200/70 backdrop-blur" *ngFor="let metric of vm.metrics(); trackBy: trackByMetric">
          <header class="flex items-center justify-between text-sm font-medium">
            <span class="text-slate-500">{{ metric.label }}</span>
            <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1" [ngClass]="badgeClass(metric.trend)">
              <span aria-hidden="true">{{ trendSymbols[metric.trend] }}</span>
              {{ metric.delta | number: '1.0-1' }}%
            </span>
          </header>
          <div class="text-3xl font-semibold text-slate-900">{{ metric.formattedValue }}</div>
          <p class="text-sm text-slate-500">{{ metric.caption }}</p>
        </article>
      </section>
    </section>
  `
})
export class HomeComponent {
  readonly vm = useHome();

  readonly trendSymbols: Record<Trend, string> = {
    up: '\u25B2',
    down: '\u25BC',
    flat: '\u25FC'
  };

  trackByMetric = (_: number, metric: { key: string }) => metric.key;

  badgeClass(trend: Trend): string {
    switch (trend) {
      case 'up':
        return 'bg-emerald-100 text-emerald-700 ring-emerald-400/60';
      case 'down':
        return 'bg-rose-100 text-rose-700 ring-rose-400/60';
      default:
        return 'bg-slate-200 text-slate-600 ring-slate-400/40';
    }
  }
}

