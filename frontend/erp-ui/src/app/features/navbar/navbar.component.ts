import { Component, EventEmitter, HostListener, Input, Output, OnDestroy } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { NavThemeService } from '../../shared/nav-theme.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, NgClass],
  template: `
    <nav
      class="fixed inset-x-0 top-0 z-50 grid items-center gap-x-5 px-6 py-3 shadow-sm border-b w-full"
      [ngClass]="[
        brandOn ? 'bg-primary-600 text-white nav--brand border-primary-600' : 'bg-white text-slate-900 border-slate-100',
        role ? 'grid-cols-[auto_minmax(280px,520px)_auto]' : 'grid-cols-[auto_1fr]'
      ]"
      aria-label="Global navigation"
    >
      <div class="flex items-center gap-3">
        <button *ngIf="role"
          type="button"
          class="grid grid-cols-3 grid-rows-3 gap-[3px] rounded-xl bg-white/10 text-white p-1.5 transition hover:bg-white/20"
          (click)="toggle.emit()"
          aria-label="Toggle navigation"
        >
          <span *ngFor="let _ of launcherDots" class="h-[5px] w-[5px] rounded-[2px] bg-current"></span>
        </button>
        <span class="text-2xl font-bold tracking-tight sync-wordmark" [ngClass]="brandOn ? 'text-white' : 'text-primary-600'" aria-label="SYNC">
          <svg class="sync-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 100" fill="currentColor" role="img" aria-label="SYNC">
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
        </span>
      </div>

      <label *ngIf="role" class="relative flex items-center justify-center w-full max-w-xl" for="global-search">
        <svg
          class="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M21 21l-4.35-4.35M16 10.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
        <input
          id="global-search"
          type="search"
          placeholder="Search for a page"
          class="w-full rounded-full border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </label>

      <div class="flex items-center justify-end justify-self-end gap-2.5">
        <!-- Home/Auth quick links (top-right for guests) -->
        <ng-container *ngIf="!role && (isHomeRoute || isAuthRoute)">
          <a routerLink="/" class="text-sm font-medium hover:underline underline-offset-4 decoration-2" [ngClass]="brandOn ? 'text-white decoration-white' : 'text-slate-900 decoration-slate-900'">Home</a>
          <a [routerLink]="['/']" fragment="about" class="text-sm font-medium hover:underline underline-offset-4 decoration-2" [ngClass]="brandOn ? 'text-white decoration-white' : 'text-slate-900 decoration-slate-900'">About us</a>
        </ng-container>
        <!-- Employee primary nav buttons (placeholders) -->
        <div *ngIf="role === 'EMPLOYEE'" class="hidden md:flex items-center gap-6 mr-2 border-l border-white/30 pl-6">
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Tasks</button>
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Leave</button>
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Training</button>
        </div>
        <!-- Admin primary nav buttons (placeholders) -->
        <div *ngIf="role === 'ADMIN'" class="hidden md:flex items-center gap-6 mr-2 border-l border-white/30 pl-6">
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Users Management</button>
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Reports Overview</button>
        </div>
        <!-- HR primary nav buttons (placeholders) -->
        <div *ngIf="role === 'HR'" class="hidden md:flex items-center gap-6 mr-2 border-l border-white/30 pl-6">
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Employee List</button>
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Leave Requests</button>
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Training</button>
        </div>
        <!-- Finance primary nav buttons (placeholders) -->
        <div *ngIf="role === 'FINANCE'" class="hidden md:flex items-center gap-6 mr-2 border-l border-white/30 pl-6">
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Budgets</button>
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Transactions</button>
          <button type="button" class="text-white text-sm font-medium hover:text-white hover:underline underline-offset-4 decoration-2 decoration-white">Reports</button>
        </div>

        
        
        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl transition" [ngClass]="brandOn ? 'text-white hover:text-white/90' : 'text-slate-900 hover:text-slate-700'" aria-label="View notifications">
          <span class="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl transition" [ngClass]="brandOn ? 'text-white hover:text-white/90' : 'text-slate-900 hover:text-slate-700'" aria-label="Open settings">
          <span class="material-symbols-outlined text-[20px]">settings</span>
        </button>

        <!-- Authenticated profile menu -->
        <div class="relative top-nav__profile-wrapper" *ngIf="user; else guestActions">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-[16px] font-semibold text-white shadow-lg"
            (click)="toggleProfileMenu()"
            [attr.aria-expanded]="isProfileMenuOpen"
            aria-haspopup="true"
          >
            {{ initials }}
          </button>

          <div
            *ngIf="isProfileMenuOpen"
            class="nav-dropdown absolute right-0 mt-3 w-52 rounded-2xl bg-white p-4 text-slate-900 shadow-2xl ring-1 ring-slate-200 z-50"
          >
            <p class="mb-3 text-xs uppercase tracking-wide text-slate-500">Signed in as</p>
            <p class="mb-4 break-all text-sm font-medium text-slate-900">{{ email }}</p>
            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
              (click)="onSignOutClick()"
            >
              Sign out
            </button>
          </div>
        </div>

        <!-- Guest actions when logged out -->
        <ng-template #guestActions>
          <a routerLink="/auth/login" class="text-sm font-medium hover:underline underline-offset-4 decoration-2" [ngClass]="brandOn ? 'text-white decoration-white' : 'text-slate-900 decoration-slate-900'">Log in</a>
          <a routerLink="/auth/register" class="text-sm font-medium hover:underline underline-offset-4 decoration-2" [ngClass]="brandOn ? 'text-white decoration-white' : 'text-slate-900 decoration-slate-900'">Sign up</a>
        </ng-template>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnDestroy {
  @Input() user: { initials: string; email: string } | null = null;
  @Input() role: string | null = null;
  @Output() toggle = new EventEmitter<void>();
  @Output() signOut = new EventEmitter<void>();
  isProfileMenuOpen = false;
  readonly launcherDots = Array.from({ length: 9 });
  isBrand = false;
  private sub = this.theme.isBrand$.subscribe(v => this.isBrand = !!v);
  isHomeRoute = false;
  isAuthRoute = false;
  private routeSub: Subscription;

  constructor(private theme: NavThemeService, private router: Router) {
    // Determine if we are on the home route ('/') to show Home-only links
    const computeIsHome = () => {
      const full = this.router.url || '/';
      const pathOnly = full.split('?')[0].split('#')[0];
      this.isHomeRoute = pathOnly === '/' || pathOnly === '';
      this.isAuthRoute = pathOnly.startsWith('/auth');
    };
    computeIsHome();
    this.routeSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => computeIsHome());
  }

  get initials(): string {
    return this.user?.initials ?? '';
  }

  get email(): string {
    return this.user?.email ?? '';
  }

  toggleProfileMenu(): void { this.isProfileMenuOpen = !this.isProfileMenuOpen; }
  onSignOutClick(): void { this.signOut.emit(); this.isProfileMenuOpen = false; }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    const t = event.target as HTMLElement | null;
    if (!t?.closest('.top-nav__profile-wrapper')) this.isProfileMenuOpen = false;
  }

  get brandOn(): boolean { return this.isBrand || !!this.role || this.isAuthRoute; }

  ngOnDestroy(): void { this.sub.unsubscribe(); this.routeSub.unsubscribe(); }
}
