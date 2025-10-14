import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <nav
      class="relative z-40 grid grid-cols-[auto_minmax(280px,520px)_auto] items-center gap-x-5 px-6 py-2 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white shadow-lg"
      aria-label="Global navigation"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="grid grid-cols-3 grid-rows-3 gap-[3px] rounded-xl bg-white/10 p-1.5 transition hover:bg-white/20"
          (click)="toggle.emit()"
          aria-label="Toggle navigation"
        >
          <span *ngFor="let _ of launcherDots" class="h-[5px] w-[5px] rounded-[2px] bg-current"></span>
        </button>
        <span class="text-base font-semibold tracking-tight">Konecta ERP</span>
      </div>

      <label class="relative flex items-center justify-center w-full max-w-xl" for="global-search">
        <svg
          class="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-200/70"
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
          class="w-full rounded-full border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-200/70 shadow-inner focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
        />
      </label>

      <div class="flex items-center justify-end gap-2.5">
        <!-- Employee primary nav buttons (placeholders) -->
        <div *ngIf="role === 'EMPLOYEE'" class="hidden md:flex items-center gap-2 mr-2">
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Home</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Tasks</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Leave</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Training</button>
        </div>
        <!-- Admin primary nav buttons (placeholders) -->
        <div *ngIf="role === 'ADMIN'" class="hidden md:flex items-center gap-2 mr-2">
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Home</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Users Management</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Reports Overview</button>
        </div>
        <!-- HR primary nav buttons (placeholders) -->
        <div *ngIf="role === 'HR'" class="hidden md:flex items-center gap-2 mr-2">
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Home</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Employee List</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Leave Requests</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Training</button>
        </div>
        <!-- Finance primary nav buttons (placeholders) -->
        <div *ngIf="role === 'FINANCE'" class="hidden md:flex items-center gap-2 mr-2">
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Home</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Budgets</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Transactions</button>
          <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Reports</button>
        </div>
        
        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20" aria-label="View notifications">
          <span class="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20" aria-label="Open settings">
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
            class="absolute right-0 mt-3 w-52 rounded-2xl bg-slate-700 p-4 text-white shadow-2xl ring-1 ring-white/10 z-50"
          >
            <p class="mb-3 text-xs uppercase tracking-wide text-slate-300">Signed in as</p>
            <p class="mb-4 break-all text-sm font-medium">{{ email }}</p>
            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
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
            class="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
          >
            Log in
          </a>
          <a
            routerLink="/auth/register"
            class="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
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
