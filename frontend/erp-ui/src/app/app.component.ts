import { Component, HostListener } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgClass
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <nav
        class="grid grid-cols-[auto_minmax(280px,520px)_auto] items-center gap-x-6 px-7 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white shadow-lg"
        aria-label="Global navigation"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="grid grid-cols-3 grid-rows-3 gap-[3px] rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
            [attr.aria-expanded]="isSidebarOpen"
            aria-controls="primary-navigation"
            aria-label="Toggle navigation"
            (click)="toggleSidebar()"
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
              {{ user.initials }}
            </button>

            <div
              *ngIf="isProfileMenuOpen"
              class="absolute right-0 mt-3 w-52 rounded-2xl bg-slate-900/95 p-4 text-white shadow-2xl ring-1 ring-white/10"
            >
              <p class="mb-3 text-xs uppercase tracking-wide text-slate-300">Signed in as</p>
              <p class="mb-4 break-all text-sm font-medium">{{ user.email }}</p>
              <a
                routerLink="/auth/login"
                class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
                (click)="closeProfileMenu()"
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div class="flex flex-1 overflow-hidden">
        <aside
          id="primary-navigation"
          class="flex flex-col border-r border-slate-300 bg-slate-200 text-slate-700 transition-all duration-300"
          [ngClass]="isSidebarOpen ? 'w-56' : 'w-20'"
          [attr.aria-expanded]="isSidebarOpen"
        >
          <ul class="flex flex-1 flex-col gap-2 px-3 py-6 overflow-hidden">
            <li *ngFor="let item of sidebarItems">
              <ng-container *ngIf="item.path; else staticItem">
                <ng-template #srLabel let-label>
                  <span class="sr-only">{{ label }}</span>
                </ng-template>
                <a
                  class="group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                  [routerLink]="item.path"
                  routerLinkActive="bg-white text-slate-900 shadow-sm"
                  [routerLinkActiveOptions]="{ exact: true }"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-slate-600 shadow-sm transition group-hover:bg-white"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5">
                      <ng-container [ngSwitch]="item.icon">
                        <path
                          *ngSwitchCase="'home'"
                          d="M4 11.5L12 4l8 7.5v7.5h-5.5v-5.5h-5V19H4z"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          *ngSwitchCase="'star'"
                          d="M12 5.3l1.7 3.4 3.7.55-2.7 2.56.64 3.72L12 14.9l-3.34 1.73.64-3.72-2.7-2.56 3.7-.55z"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <ng-container *ngSwitchCase="'clock'">
                          <circle
                            cx="12"
                            cy="12"
                            r="6.8"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.4"
                          ></circle>
                          <path
                            d="M12 8v4l3 1.8"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.4"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                        </ng-container>
                        <ng-container *ngSwitchCase="'boards'">
                          <rect
                            x="4.5"
                            y="6"
                            width="15"
                            height="12"
                            rx="1.4"
                            ry="1.4"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.4"
                          ></rect>
                          <line
                            x1="4.5"
                            y1="11.5"
                            x2="19.5"
                            y2="11.5"
                            stroke="currentColor"
                            stroke-width="1.2"
                            stroke-linecap="round"
                          ></line>
                          <line
                            x1="12"
                            y1="6"
                            x2="12"
                            y2="18"
                            stroke="currentColor"
                            stroke-width="1.2"
                            stroke-linecap="round"
                          ></line>
                        </ng-container>
                        <path
                          *ngSwitchDefault
                          d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                          stroke-linejoin="round"
                        ></path>
                      </ng-container>
                    </svg>
                  </span>
                  <span *ngIf="isSidebarOpen; else iconOnly" class="whitespace-nowrap text-sm font-medium">
                    {{ item.label }}
                  </span>
                  <ng-template #iconOnly>
                    <ng-container *ngTemplateOutlet="srLabel; context: { $implicit: item.label }"></ng-container>
                  </ng-template>
                </a>
              </ng-container>
              <ng-template #staticItem>
                <ng-template #srLabelStatic let-label>
                  <span class="sr-only">{{ label }}</span>
                </ng-template>
                <button
                  type="button"
                  class="group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-slate-600 shadow-sm transition group-hover:bg-white"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5">
                      <path
                        d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linejoin="round"
                      ></path>
                    </svg>
                  </span>
                  <span *ngIf="isSidebarOpen; else iconOnlyStatic" class="whitespace-nowrap text-sm font-medium">
                    {{ item.label }}
                  </span>
                  <ng-template #iconOnlyStatic>
                    <ng-container *ngTemplateOutlet="srLabelStatic; context: { $implicit: item.label }"></ng-container>
                  </ng-template>
                </button>
              </ng-template>
            </li>
          </ul>
        </aside>

        <main class="flex-1 overflow-y-auto bg-white p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AppComponent {
  readonly sidebarItems = [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Favorites', icon: 'star' },
    { label: 'Recent', icon: 'clock' },
    { label: 'Workspaces', icon: 'boards' },
    { label: 'Modules', icon: 'grid' }
  ];

  readonly launcherDots = Array.from({ length: 9 });

  isSidebarOpen = false;
  isProfileMenuOpen = false;

  readonly user = {
    initials: 'BI',
    email: 'bi@example.com'
  };

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.top-nav__profile-wrapper')) {
      this.closeProfileMenu();
    }
  }
}











