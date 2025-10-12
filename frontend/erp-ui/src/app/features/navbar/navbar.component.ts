import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <nav
      class="relative z-40 grid grid-cols-[auto_minmax(280px,520px)_auto] items-center gap-x-6 px-7 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white shadow-lg"
      aria-label="Global navigation"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="grid grid-cols-3 grid-rows-3 gap-[3px] rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
          (click)="toggle.emit()"
          aria-label="Toggle navigation"
        >
          <span *ngFor="let _ of launcherDots" class="h-[6px] w-[6px] rounded-[2px] bg-current"></span>
        </button>
        <span class="text-lg font-semibold tracking-tight">Konecta ERP</span>
      </div>

      <label class="relative flex items-center justify-center w-full max-w-xl" for="global-search">
        <svg
          class="pointer-events-none absolute left-4 h-5 w-5 text-slate-200/70"
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
          class="w-full rounded-full border border-white/10 bg-white/10 py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-200/70 shadow-inner focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
        />
      </label>

      <div class="flex items-center justify-end gap-3">
        <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20" aria-label="Open workspaces">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5">
            <path
              d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>
        <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20" aria-label="View notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5">
            <path
              d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zM18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>
        <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20" aria-label="Open settings">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5">
            <path
              d="M12 8.5a3.5 3.5 0 103.5 3.5A3.5 3.5 0 0012 8.5zm9 3.05l-1.8-.28a7.13 7.13 0 00-.68-1.64l1.07-1.44a.9.9 0 00-.1-1.16l-1.9-1.9a.9.9 0 00-1.16-.1l-1.44 1.07a7.13 7.13 0 00-1.64-.68L14.45 2a.9.9 0 00-.9-.75h-3.1a.9.9 0 00-.9.75l-.28 1.8a7.13 7.13 0 00-1.64.68L6.1 3.41a.9.9 0 00-1.16.1l-1.9 1.9a.9.9 0 00-.1 1.16l1.07 1.44a7.13 7.13 0 00-.68 1.64L2 11.55a.9.9 0 00-.75.9v3.1a.9.9 0 00.75.9l1.8.28a7.13 7.13 0 00.68 1.64l-1.07 1.44a.9.9 0 00.1 1.16l1.9 1.9a.9.9 0 001.16.1l1.44-1.07a7.13 7.13 0 001.64.68l.28 1.8a.9.9 0 00.9.75h3.1a.9.9 0 00.9-.75l.28-1.8a7.13 7.13 0 001.64-.68l1.44 1.07a.9.9 0 001.16-.1l1.9-1.9a.9.9 0 00.1-1.16l-1.07-1.44a7.13 7.13 0 00.68-1.64l1.8-.28a.9.9 0 00.75-.9v-3.1a.9.9 0 00-.75-.9z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>

        <div class="relative top-nav__profile-wrapper">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-sm font-semibold text-white shadow-lg"
            (click)="toggleProfileMenu()"
            [attr.aria-expanded]="isProfileMenuOpen"
            aria-haspopup="true"
          >
            {{ initials }}
          </button>

          <div
            *ngIf="isProfileMenuOpen"
            class="absolute right-0 mt-3 w-52 rounded-2xl bg-slate-900/95 p-4 text-white shadow-2xl ring-1 ring-white/10 z-50"
          >
            <p class="mb-3 text-xs uppercase tracking-wide text-slate-300">Signed in as</p>
            <p class="mb-4 break-all text-sm font-medium">{{ email }}</p>
            <a
              routerLink="/auth/login"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
              (click)="isProfileMenuOpen=false"
            >
              Log in
            </a>
            <button
              type="button"
              class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500/35"
              (click)="onSignOutClick()"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  @Input() user: { initials: string; email: string } | null = null;
  @Output() toggle = new EventEmitter<void>();
  @Output() signOut = new EventEmitter<void>();
  isProfileMenuOpen = false;
  readonly launcherDots = Array.from({ length: 9 });

  get initials(): string {
    return (
      this.user?.initials ||
      (this.user?.email ? this.user.email.slice(0, 2).toUpperCase() : 'BI')
    );
  }

  get email(): string {
    return this.user?.email || 'bi@example.com';
  }

  toggleProfileMenu(): void { this.isProfileMenuOpen = !this.isProfileMenuOpen; }
  onSignOutClick(): void { this.signOut.emit(); this.isProfileMenuOpen = false; }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    const t = event.target as HTMLElement | null;
    if (!t?.closest('.top-nav__profile-wrapper')) this.isProfileMenuOpen = false;
  }
}
