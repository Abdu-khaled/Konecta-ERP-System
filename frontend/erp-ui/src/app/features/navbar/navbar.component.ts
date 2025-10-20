import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <nav
      class="relative z-40 grid grid-cols-[auto_minmax(280px,520px)_auto] items-center gap-x-5 px-6 py-3 bg-white text-slate-900 shadow-sm border-b border-slate-100"
      aria-label="Global navigation"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="grid grid-cols-3 grid-rows-3 gap-[3px] rounded-xl bg-primary-600/10 text-primary-600 p-1.5 transition hover:bg-primary-600/20"
          (click)="toggle.emit()"
          aria-label="Toggle navigation"
        >
          <span *ngFor="let _ of launcherDots" class="h-[5px] w-[5px] rounded-[2px] bg-current"></span>
        </button>
        <span class="text-2xl font-bold tracking-tight sync-wordmark text-primary-600" aria-label="SYNC">
          <!-- Single SVG wordmark so letters align/scale together -->
          <svg class="sync-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 100" fill="currentColor" role="img" aria-label="SYNC">
            <style>
              .sync-text{font:700 70px 'Poppins', Arial, sans-serif;}
            </style>
            <!-- SY (tight letter spacing) -->
            <text x="0" y="76" class="sync-text" style="letter-spacing:-4px">SY</text>
            <!-- N path (pulled left and slightly larger) -->
            <g transform="translate(-20,18) scale(2)">
              <path d="M205.3,19.2l-7.589,17.871a7.06,7.06,0,0,1-4.246,3.936,7.054,7.054,0,0,1-4.5,0,7.07,7.07,0,0,1-4.229-3.9l-.037-.085-3-7.068L178.956,23.5l-.025-.056a.543.543,0,0,0-.978.048l-2.746,6.47L170.36,41.378l-5.994-2.543,7.589-17.877a7.053,7.053,0,0,1,12.994,0l3.017,7.107,2.723,6.414,0,.008a.614.614,0,0,0,.042.1l0,.006a.545.545,0,0,0,.964-.031.345.345,0,0,0,.02-.048l2.737-6.448L199.3,16.658Z" transform="translate(-118.027 -11.956)" />
            </g>
            <!-- C (moved left to close gap with N) -->
            <text x="150" y="76" class="sync-text">C</text>
          </svg>
        </span>
      </div>

      <label class="relative flex items-center justify-center w-full max-w-xl" for="global-search">
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

      <div class="flex items-center justify-end gap-2.5">
        <!-- Employee primary nav buttons (placeholders) -->
        <div *ngIf="role === 'EMPLOYEE'" class="hidden md:flex items-center gap-6 mr-2 border-l border-slate-200 pl-6">
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">About us</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Solutions</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Industries</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">News & Insights</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Join us</button>
        </div>
        <!-- Admin primary nav buttons (placeholders) -->
        <div *ngIf="role === 'ADMIN'" class="hidden md:flex items-center gap-6 mr-2 border-l border-slate-200 pl-6">
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">About us</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Solutions</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Reports Overview</button>
        </div>
        <!-- HR primary nav buttons (placeholders) -->
        <div *ngIf="role === 'HR'" class="hidden md:flex items-center gap-6 mr-2 border-l border-slate-200 pl-6">
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">About us</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Solutions</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Leave Requests</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Training</button>
        </div>
        <!-- Finance primary nav buttons (placeholders) -->
        <div *ngIf="role === 'FINANCE'" class="hidden md:flex items-center gap-6 mr-2 border-l border-slate-200 pl-6">
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">About us</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Budgets</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Transactions</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Reports</button>
        </div>

        <!-- IT / Operations primary nav (static) -->
        <div *ngIf="role === 'IT' || role === 'OPERATIONS' || role === 'IT_OPS'" class="hidden md:flex items-center gap-6 mr-2 border-l border-slate-200 pl-6">
          <a routerLink="/it" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">About us</a>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Infrastructure</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Tickets</button>
          <button type="button" class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600">Monitoring</button>
        </div>
        
        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-900 transition hover:text-primary-600" aria-label="View notifications">
          <span class="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-900 transition hover:text-primary-600" aria-label="Open settings">
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
            class="absolute right-0 mt-3 w-52 rounded-2xl bg-white p-4 text-slate-900 shadow-2xl ring-1 ring-slate-200 z-50"
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
          <a
            routerLink="/auth/login"
            class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600"
          >
            Log in
          </a>
          <a
            routerLink="/auth/register"
            class="text-slate-900 text-sm font-medium hover:text-primary-600 hover:underline underline-offset-4 decoration-2 decoration-primary-600"
          >
            Sign up
          </a>
        </ng-template>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  @Input() user: { initials: string; email: string } | null = null;
  @Input() role: string | null = null;
  @Output() toggle = new EventEmitter<void>();
  @Output() signOut = new EventEmitter<void>();
  isProfileMenuOpen = false;
  readonly launcherDots = Array.from({ length: 9 });

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
}
