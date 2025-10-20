import { Component } from '@angular/core';
import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common';

interface ServiceItem {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseMs: number;
}

@Component({
  selector: 'app-it-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, NgClass],
  template: `
    <section class="flex flex-col gap-7 py-4">
      <header class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">IT / Operations Dashboard</h1>
          <p class="text-sm text-slate-500">System health, services, and operational status.</p>
        </div>
        <div class="flex gap-2">
          <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">View Incidents</button>
          <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">Maintenance Logs</button>
        </div>
      </header>

      <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <!-- Uptime / Response Time -->
        <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
          <h3 class="text-sm font-semibold text-slate-600 mb-3">Server Uptime / Response Time</h3>
          <div class="flex items-baseline gap-3">
            <div class="text-3xl font-semibold text-slate-900">{{ uptime }}</div>
            <span class="text-sm text-slate-500">uptime</span>
          </div>
          <p class="mt-2 text-sm text-slate-600">Median response: <span class="font-semibold">{{ responseTimeMs }} ms</span></p>
          <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-emerald-500" [style.width.%]="uptimeValue"></div>
          </div>
        </article>

        <!-- Active Services -->
        <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-1 xl:col-span-2">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-600">Active Services</h3>
            <span class="text-xs font-semibold text-indigo-600">Service Status</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div *ngFor="let s of services" class="rounded-xl border border-slate-200 p-4 bg-white">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-slate-900">{{ s.name }}</span>
                <span class="text-[11px] rounded-full px-2 py-0.5 font-semibold text-white"
                      [ngClass]="{
                        'bg-emerald-600': s.status === 'UP',
                        'bg-amber-600': s.status === 'DEGRADED',
                        'bg-rose-600': s.status === 'DOWN'
                      }">{{ s.status }}</span>
              </div>
              <p class="mt-2 text-xs text-slate-600">Response: <span class="font-semibold">{{ s.responseMs }} ms</span></p>
            </div>
          </div>
        </article>

        <!-- Recent Errors / Alerts -->
        <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
          <h3 class="text-sm font-semibold text-slate-600 mb-3">Recent Errors or Alerts</h3>
          <ul class="text-sm text-slate-700 space-y-2" *ngIf="alerts?.length; else noAlerts">
            <li *ngFor="let a of alerts" class="flex items-start gap-2">
              <span class="material-symbols-outlined text-amber-600 text-[18px] leading-5">warning</span>
              <span>{{ a }}</span>
            </li>
          </ul>
          <ng-template #noAlerts>
            <p class="text-sm text-slate-500">No active alerts.</p>
          </ng-template>
        </article>

        <!-- Backup Status -->
        <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-sm font-semibold text-slate-600">Backup Status</h3>
            <span class="text-xs font-semibold text-indigo-600">Details</span>
          </div>
          <p class="text-sm text-slate-700">Last backup: <span class="font-semibold">{{ lastBackup | date:'medium' }}</span></p>
          <p class="text-sm text-slate-700">Status: <span class="font-semibold" [ngClass]="backupOk ? 'text-emerald-700' : 'text-rose-700'">{{ backupOk ? 'OK' : 'Attention needed' }}</span></p>
          <p class="text-sm text-slate-700">Next scheduled: <span class="font-semibold">{{ nextBackup | date:'short' }}</span></p>
        </article>

        <!-- Upcoming Maintenance -->
        <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-2 xl:col-span-1">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-sm font-semibold text-slate-600">Upcoming Maintenance</h3>
            <span class="text-xs font-semibold text-indigo-600">Schedule</span>
          </div>
          <ul class="text-sm text-slate-700 space-y-2">
            <li *ngFor="let m of maintenance">
              <span class="font-medium">{{ m.date | date:'MMM d, y HH:mm' }}</span>
              <span class="mx-2 text-slate-400">•</span>
              <span>{{ m.note }}</span>
            </li>
          </ul>
        </article>
      </section>
    </section>
  `
})
export class ItDashboardComponent {
  uptime = '99.98%';
  responseTimeMs = 120;
  get uptimeValue(): number { return parseFloat(this.uptime) || 0; }

  services: ServiceItem[] = [
    { name: 'Eureka (Discovery)', status: 'UP', responseMs: 35 },
    { name: 'Gateway', status: 'UP', responseMs: 42 },
    { name: 'Config Server', status: 'UP', responseMs: 51 },
    { name: 'Auth Service', status: 'UP', responseMs: 48 },
    { name: 'HR Service', status: 'DEGRADED', responseMs: 210 },
    { name: 'Finance Service', status: 'UP', responseMs: 60 },
    { name: 'Reporting Service', status: 'UP', responseMs: 75 },
  ];

  alerts: string[] = [
    'High latency detected on HR Service (p95 350ms).',
    'Upcoming backup window starts at 02:00 UTC.',
  ];

  lastBackup = new Date(Date.now() - 1000 * 60 * 60 * 6); // 6 hours ago
  nextBackup = new Date(Date.now() + 1000 * 60 * 60 * 18); // in 18 hours
  backupOk = true;

  maintenance = [
    { date: new Date(Date.now() + 1000 * 60 * 60 * 24), note: 'DB minor patching (read-only for 10m).' },
    { date: new Date(Date.now() + 1000 * 60 * 60 * 48), note: 'Gateway rolling restart.' },
  ];
}
