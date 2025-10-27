import { Component, inject, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { useHome } from './home.hook';
import { AuthState } from '../../core/services/auth-state.service';
import { NavThemeService } from '../../shared/nav-theme.service';
import { InviteUserComponent } from '../../modules/admin/components/invite-user/invite-user.component';
import { ActivatedRoute } from '@angular/router';

type Trend = 'up' | 'down' | 'flat';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, DecimalPipe, InviteUserComponent],
  template: `
    <section class="flex flex-col gap-7" [ngClass]="role ? 'py-4' : 'pt-0 pb-4'">
      <!-- Guest marketing-style home when not logged in -->
      <ng-container *ngIf="!role; else loggedIn">
        <!-- Hero -->
        <section id="hero" class="bg-primary-600 text-white pt-12 sm:pt-16 pb-16 sm:pb-24">
          <div class="mx-auto max-w-6xl px-6 pt-10 sm:pt-12 pb-16 sm:pb-24">
          <p class="text-center text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-wider uppercase opacity-95 mb-0 sm:mb-0 translate-y-7">
            Your Work finally in
          </p>
            <div class="-mt-2 flex justify-center lg:translate-x-6">
              <svg class="w-[520px] sm:w-[680px] h-auto text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 100" fill="currentColor" role="img" aria-label="SYNC">
                <style>.sync-text{font:700 70px 'Poppins', Arial, sans-serif;}</style>
                <text x="10" y="76" class="sync-text" style="letter-spacing:-2px">
                  <tspan>S</tspan>
                  <tspan dx="3" dy="-2" style="font-size:82px">y</tspan>
                </text>
                <g transform="translate(3,18) scale(2)">
                  <path d="M205.3,19.2l-7.589,17.871a7.06,7.06,0,0,1-4.246,3.936,7.054,7.054,0,0,1-4.5,0,7.07,7.07,0,0,1-4.229-3.9l-.037-.085-3-7.068L178.956,23.5l-.025-.056a.543.543,0,0,0-.978.048l-2.746,6.47L170.36,41.378l-5.994-2.543,7.589-17.877a7.053,7.053,0,0,1,12.994,0l3.017,7.107,2.723,6.414,0,.008a.614.614,0,0,0,.042.1l0,.006a.545.545,0,0,0,.964-.031.345.345,0,0,0,.02-.048l2.737-6.448L199.3,16.658Z" transform="translate(-118.027 -11.956)" />
                </g>
                <text x="176" y="76" class="sync-text">C</text>
              </svg>
            </div>
            <p class="mt-4 text-center text-lg opacity-90 max-w-3xl mx-auto">
              A modern ERP platform that unifies HR, Finance, and Reporting with a clean, fast experience.
            </p>
            <div class="mt-6 flex items-center justify-center gap-4">
              <a href="#modules" class="rounded-full border border-white/70 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10">Explore modules</a>
            </div>
          </div>
        </section>

        <!-- About us (home-only) -->
        <section id="about" class="mx-auto max-w-6xl px-6 py-10 sm:py-12">
          <h2 class="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">About us</h2>
          <p class="mt-3 text-center text-slate-600 max-w-3xl mx-auto">
            Konecta ERP System is a modern platform focused on simplicity and speed. 
            We help teams stay in sync across HR, Finance and Reporting.
          </p>
        </section>

        <!-- Modules overview -->
        <section id="modules" class="mx-auto max-w-6xl px-6 py-12 sm:py-16">
          <h2 class="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">All your business in one platform</h2>
          <p class="mt-2 text-center text-slate-500">Simple, efficient, and scalable for your team.</p>
          <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-base font-semibold text-slate-900">Human Resources</h3>
              <p class="mt-2 text-sm text-slate-600">Employees, attendance, leave, performance, and payroll integrations.</p>
            </article>
            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-base font-semibold text-slate-900">Finance</h3>
              <p class="mt-2 text-sm text-slate-600">Invoices, expenses, budgets, approvals, and forecasts.</p>
            </article>
            <article class="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-base font-semibold text-slate-900">Reporting</h3>
              <p class="mt-2 text-sm text-slate-600">Dashboards and analytics to keep your team aligned.</p>
            </article>
          </div>
          <div class="mt-10 text-center">
            <a routerLink="/auth/login" class="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">Log in</a>
          </div>
        </section>
      </ng-container>

      <!-- Logged-in dashboards preserved below -->
      <ng-template #loggedIn>
      <ng-container *ngIf="role === 'ADMIN'; else notAdmin">
        <ng-container *ngIf="!showInvite; else inviteView">
        <header class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p class="text-sm text-slate-500">Global statistics and controls.</p>
          </div>
          <div class="flex gap-2">
            <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700" (click)="showInvite = true">Invite Users</button>
            <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Manage Roles</button>
            <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">System Settings</button>
          </div>
        </header>

        <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold mb-3">Users</h3>
            <div class="text-3xl font-semibold"><span>Total:</span> <span class="text-black">-</span></div>
            <p class="text-sm">Active employees: <span class="text-black">-</span> - Departments: <span class="text-black">-</span></p>
          </article>

          <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold mb-3">System Uptime</h3>
            <div class="text-3xl font-semibold text-black">-</div>
            <p class="text-sm">Recent logins: <span class="text-black">-</span></p>
          </article>

          <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold mb-3">Requests & Registrations</h3>
            <p class="text-3xl font-semibold">Pending: <span class="text-black">-</span></p>
            <p class="text-sm">New registrations: <span class="text-black">-</span></p>
          </article>

          <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-2 xl:col-span-1">
            <h3 class="text-sm font-semibold mb-3">Notifications</h3>
            <ul class="text-sm space-y-2">
              <li>System: Backup completed</li>
              <li>Security: Review access changes</li>
              <li>HR: New department created</li>
            </ul>
          </article>
        </section>
        </ng-container>
        <ng-template #inviteView>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
            <div class="space-y-1">
              <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Invite Users</h1>
              <p class="text-sm text-slate-500">Send invitations to HR, Finance, or Employees.</p>
            </div>
            <div class="flex gap-2">
              <!-- Back button removed; navigation handled via sidebar Dashboard link -->
            </div>
          </div>
          <app-admin-invite-user></app-admin-invite-user>
        </ng-template>
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
            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold mb-3">Total Budget vs Spent</h3>
              <div class="text-3xl font-semibold text-black">-</div>
              <p class="text-sm">Summary of allocations vs expenses.</p>
            </article>

            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold mb-3">Pending Invoices</h3>
              <div class="text-3xl font-semibold text-black">-</div>
              <p class="text-sm">Awaiting approval/payment.</p>
            </article>

            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold mb-3">Monthly Payroll Summary</h3>
              <p class="text-3xl font-semibold text-black">-</p>
              <p class="text-sm">Linked to HR data.</p>
            </article>

            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold mb-3">Expense Categories</h3>
              <div class="text-3xl font-semibold text-black">-</div>
              <p class="text-sm">Pie chart placeholder.</p>
            </article>

            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-2 xl:col-span-1">
              <h3 class="text-sm font-semibold mb-3">AI Insights (Forecasts)</h3>
              <ul class="text-sm space-y-2">
                <li>Forecasted Revenue: <span class="text-black">-</span></li>
                <li>Forecasted Expenses: <span class="text-black">-</span></li>
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
            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold mb-3">Total Employees</h3>
              <div class="text-3xl font-semibold text-black">-</div>
              <p class="text-sm">Current headcount across departments.</p>
            </article>

            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold mb-3">Attendance Today</h3>
              <div class="text-3xl font-semibold text-black">-</div>
              <p class="text-sm">Check-ins recorded for today.</p>
            </article>

            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold mb-3">Leave Requests Pending</h3>
              <p class="text-3xl font-semibold text-black">-</p>
              <p class="text-sm">Awaiting approval.</p>
            </article>

            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold mb-3">Training Sessions This Month</h3>
              <div class="text-3xl font-semibold text-black">-</div>
              <p class="text-sm">Planned or completed.</p>
            </article>

            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
              <h3 class="text-sm font-semibold mb-3">Top Performers</h3>
              <div class="text-3xl font-semibold text-black">-</div>
              <p class="text-sm">Based on latest reviews.</p>
            </article>

            <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-2 xl:col-span-1">
              <h3 class="text-sm font-semibold mb-3">AI Insights (Coming Soon)</h3>
              <ul class="text-sm space-y-2">
                <li>Attrition Risk: <span class="text-black">-</span></li>
                <li>Training Needs: <span class="text-black">-</span></li>
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
              <p class="text-sm text-slate-500">Here's your overview for today.</p>
            </div>
          <div class="flex gap-2">
            <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Request Leave</button>
            <button type="button" class="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">Update Profile</button>
          </div>
        </header>

        <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold mb-3">Attendance</h3>
            <div class="text-3xl font-semibold">Present</div>
            <p class="text-sm">You have <span class="text-black">0</span> absences this week.</p>
          </article>

          <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold mb-3">Current Tasks</h3>
            <ul class="text-sm list-disc pl-5 space-y-1">
              <li>Finish onboarding checklist</li>
              <li>Complete Q4 safety training</li>
              <li>Submit weekly status report</li>
            </ul>
          </article>

          <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold mb-3">Salary Summary</h3>
            <p class="text-3xl font-semibold">$ <span class="text-black">-</span></p>
            <p class="text-sm">View latest payslip from Finance.</p>
            <button type="button" class="mt-3 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">Open Payslip</button>
          </article>

          <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70">
            <h3 class="text-sm font-semibold mb-3">Performance Rating</h3>
            <div class="text-3xl font-semibold text-black">-</div>
            <p class="text-sm">Your last review is available in HR.</p>
          </article>

          <article class="rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70 md:col-span-2 xl:col-span-1">
            <h3 class="text-sm font-semibold mb-3">Notifications</h3>
            <ul class="text-sm space-y-2">
              <li>HR: New holiday schedule announced</li>
              <li>Announcement: Office maintenance on Friday</li>
              <li>Training: Data Security 101 available</li>
            </ul>
          </article>
        </section>
          </ng-container>
        </ng-template>
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
          <article class="flex flex-col gap-3 rounded-2xl bg-white text-slate-900 p-6 shadow-md ring-1 ring-slate-200/70" *ngFor="let metric of vm.metrics(); trackBy: trackByMetric">
            <header class="flex items-center justify-between text-sm font-medium">
              <span class="text-slate-900">{{ metric.label }}</span>
              <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1" [ngClass]="badgeClass(metric.trend)">
                <span aria-hidden="true">{{ trendSymbol(metric.trend) }}</span>
                {{ metric.delta | number: '1.0-1' }}%
              </span>
            </header>
            <div class="text-3xl font-semibold text-black">{{ metric.formattedValue }}</div>
            <p class="text-sm text-slate-600">{{ metric.caption }}</p>
          </article>
        </section>
      </ng-template>
    </section>
  `
})
export class HomeComponent implements AfterViewInit, OnDestroy, OnInit {
  readonly vm = useHome();
  private readonly state = inject(AuthState);
  private readonly navTheme = inject(NavThemeService);
  private readonly route = inject(ActivatedRoute);
  private heroObserver?: IntersectionObserver;
  showInvite = false;
  get role(): string | null { return this.state.profile?.role ?? null; }
  get firstName(): string { return (this.state.profile?.username || '').split(' ')[0] || 'Employee'; }

  readonly trendSymbols: Record<Trend, string> = {
    up: '\\u25B2',
    down: '\\u25BC',
    flat: '\\u25FC'
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
  trendSymbol(trend: Trend): string { return this.trendSymbols[trend]; }

  ngOnInit(): void {
    const dataInvite = this.route.snapshot.data?.['inviteView'] || this.route.parent?.snapshot?.data?.['inviteView'];
    const qpInvite = this.route.snapshot.queryParamMap.get('invite');
    if (dataInvite || qpInvite === '1' || qpInvite === 'true') {
      this.showInvite = true;
    }
  }
  ngAfterViewInit(): void {
    if (!this.role) {
      const hero = document.getElementById('hero');
      if (hero) {
        this.heroObserver = new IntersectionObserver((entries) => {
          const e = entries[0];
          this.navTheme.setBrand(e.isIntersecting && e.intersectionRatio > 0.1);
        }, { threshold: [0, 0.1, 0.3, 0.6, 1] });
        this.heroObserver.observe(hero);
        const rect = hero.getBoundingClientRect();
        const inView = rect.top <= (window.innerHeight || 0) && rect.bottom >= 0;
        this.navTheme.setBrand(inView);
      } else {
        this.navTheme.setBrand(false);
      }
    }
  }

  ngOnDestroy(): void {
    this.heroObserver?.disconnect();
    this.navTheme.setBrand(false);
  }
}
