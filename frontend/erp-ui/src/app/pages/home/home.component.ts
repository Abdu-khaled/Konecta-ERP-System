import { Component, inject } from '@angular/core';
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { useHome } from './home.hook';
import { AuthState } from '../../features/auth/services/auth.state';

type Trend = 'up' | 'down' | 'flat';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, DecimalPipe],
  template: `
    <section class="flex flex-col gap-7 py-4">
      <ng-container *ngIf="role === 'ADMIN'; else notAdmin">
        <header class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p class="text-sm text-slate-500">Global statistics and controls.</p>
          </div>
          <div class="flex gap-2">
            <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Manage Roles</button>
            <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">System Settings</button>
          </div>
        </header>

        <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold text-slate-600 mb-3">Users</h3>
            <div class="text-3xl font-semibold text-slate-900">Total: —</div>
            <p class="text-sm text-slate-500">Active employees: — • Departments: —</p>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold text-slate-600 mb-3">System Uptime</h3>
            <div class="text-3xl font-semibold text-slate-900">—</div>
            <p class="text-sm text-slate-500">Recent logins: —</p>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold text-slate-600 mb-3">Requests & Registrations</h3>
            <p class="text-3xl font-semibold text-slate-900">Pending: —</p>
            <p class="text-sm text-slate-500">New registrations: —</p>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-2 xl:col-span-1">
            <h3 class="text-sm font-semibold text-slate-600 mb-3">Notifications</h3>
            <ul class="text-sm text-slate-700 space-y-2">
              <li>System: Backup completed</li>
              <li>Security: Review access changes</li>
              <li>HR: New department created</li>
            </ul>
          </article>
        </section>
      </ng-container>

      <ng-template #notAdmin>
        <ng-container *ngIf="role === 'FINANCE'; else notFinance">
          <header class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-1">
              <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Finance Dashboard</h1>
              <p class="text-sm text-slate-500">Budget and transaction insights.</p>
            </div>
            <div class="flex gap-2">
              <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Budgets</button>
              <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Transactions</button>
            </div>
          </header>

          <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">Total Budget vs Spent</h3>
              <div class="text-3xl font-semibold text-slate-900">—</div>
              <p class="text-sm text-slate-500">Summary of allocations vs expenses.</p>
            </article>

            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">Pending Invoices</h3>
              <div class="text-3xl font-semibold text-slate-900">—</div>
              <p class="text-sm text-slate-500">Awaiting approval/payment.</p>
            </article>

            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">Monthly Payroll Summary</h3>
              <p class="text-3xl font-semibold text-slate-900">—</p>
              <p class="text-sm text-slate-500">Linked to HR data.</p>
            </article>

            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">Expense Categories</h3>
              <div class="text-3xl font-semibold text-slate-900">—</div>
              <p class="text-sm text-slate-500">Pie chart placeholder.</p>
            </article>

            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-2 xl:col-span-1">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">AI Insights (Forecasts)</h3>
              <ul class="text-sm text-slate-700 space-y-2">
                <li>Forecasted Revenue: —</li>
                <li>Forecasted Expenses: —</li>
              </ul>
            </article>
          </section>
        </ng-container>

        <ng-template #notFinance>
        <ng-container *ngIf="role === 'HR'; else notHr">
          <header class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-1">
              <h1 class="text-2xl font-semibold tracking-tight text-slate-900">HR Dashboard</h1>
              <p class="text-sm text-slate-500">Workforce and attendance insights.</p>
            </div>
            <div class="flex gap-2">
              <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Manage Employees</button>
              <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">HR Settings</button>
            </div>
          </header>

          <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">Total Employees</h3>
              <div class="text-3xl font-semibold text-slate-900">—</div>
              <p class="text-sm text-slate-500">Current headcount across departments.</p>
            </article>

            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">Attendance Today</h3>
              <div class="text-3xl font-semibold text-slate-900">—</div>
              <p class="text-sm text-slate-500">Check-ins recorded for today.</p>
            </article>

            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">Leave Requests Pending</h3>
              <p class="text-3xl font-semibold text-slate-900">—</p>
              <p class="text-sm text-slate-500">Awaiting approval.</p>
            </article>

            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">Training Sessions This Month</h3>
              <div class="text-3xl font-semibold text-slate-900">—</div>
              <p class="text-sm text-slate-500">Planned or completed.</p>
            </article>

            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">Top Performers</h3>
              <div class="text-3xl font-semibold text-slate-900">—</div>
              <p class="text-sm text-slate-500">Based on latest reviews.</p>
            </article>

            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-2 xl:col-span-1">
              <h3 class="text-sm font-semibold text-slate-600 mb-3">AI Insights (Coming Soon)</h3>
              <ul class="text-sm text-slate-700 space-y-2">
                <li>Attrition Risk: —</li>
                <li>Training Needs: —</li>
              </ul>
            </article>
          </section>
        </ng-container>
        </ng-template>

        <ng-template #notHr>
          <ng-container *ngIf="role === 'EMPLOYEE'; else defaultDashboard">
          <header class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-1">
              <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Welcome {{ firstName }}!</h1>
              <p class="text-sm text-slate-500">Here’s your overview for today.</p>
            </div>
          <div class="flex gap-2">
            <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Request Leave</button>
            <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Update Profile</button>
          </div>
        </header>

        <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold text-slate-600 mb-3">Attendance</h3>
            <div class="text-3xl font-semibold text-slate-900">Present</div>
            <p class="text-sm text-slate-500">You have 0 absences this week.</p>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold text-slate-600 mb-3">Current Tasks</h3>
            <ul class="text-sm text-slate-700 list-disc pl-5 space-y-1">
              <li>Finish onboarding checklist</li>
              <li>Complete Q4 safety training</li>
              <li>Submit weekly status report</li>
            </ul>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold text-slate-600 mb-3">Salary Summary</h3>
            <p class="text-3xl font-semibold text-slate-900">$ —</p>
            <p class="text-sm text-slate-500">View latest payslip from Finance.</p>
            <button type="button" class="mt-3 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Open Payslip</button>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold text-slate-600 mb-3">Performance Rating</h3>
            <div class="text-3xl font-semibold text-slate-900">—</div>
            <p class="text-sm text-slate-500">Your last review is available in HR.</p>
          </article>

          <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-2 xl:col-span-1">
            <h3 class="text-sm font-semibold text-slate-600 mb-3">Notifications</h3>
            <ul class="text-sm text-slate-700 space-y-2">
              <li>HR: New holiday schedule announced</li>
              <li>Announcement: Office maintenance on Friday</li>
              <li>Training: Data Security 101 available</li>
            </ul>
          </article>
        </section>
          </ng-container>
        </ng-template>
      </ng-template>

      <ng-template #defaultDashboard>
        <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
            <p class="text-sm text-slate-500">Snapshot of today's performance across key business areas.</p>
          </div>
          <button type="button" class="inline-flex items-center justify-center self-start rounded-full border border-primary-600 bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 sm:self-center" (click)="vm.refresh()">Refresh data</button>
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
      </ng-template>
    </section>
  `
})
export class HomeComponent {
  readonly vm = useHome();
  private readonly state = inject(AuthState);
  get role(): string | null { return this.state.profile?.role ?? null; }
  get firstName(): string { return (this.state.profile?.username || '').split(' ')[0] || 'Employee'; }

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
