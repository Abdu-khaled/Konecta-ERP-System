import { Component, Input } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault, RouterLink, RouterLinkActive],
  template: `
    <aside
      id="primary-navigation"
      class="relative z-10 flex shrink-0 flex-col border-r border-slate-300 bg-slate-200 text-slate-700 transition-all duration-300 h-full min-h-full"
      [ngClass]="isOpen ? 'w-56 basis-56' : 'w-16 basis-16'"
      [attr.aria-expanded]="isOpen"
    >
      <ul class="flex flex-1 flex-col gap-1 px-2 py-4 overflow-hidden min-h-full">
        <li *ngFor="let item of computedItems">
          <ng-container *ngIf="item.path; else staticItem">
            <a
              class="group flex items-center gap-2.5 rounded-2xl px-2.5 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
              [routerLink]="item.path"
              routerLinkActive="bg-white text-slate-900 shadow-sm"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-600 shadow-sm transition group-hover:bg-white">
                <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5">
                  <ng-container [ngSwitch]="item.icon">
                    <path *ngSwitchCase="'home'" d="M4 11.5L12 4l8 7.5v7.5h-5.5v-5.5h-5V19H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path>
                    <path *ngSwitchCase="'star'" d="M12 5.3l1.7 3.4 3.7.55-2.7 2.56.64 3.72L12 14.9l-3.34 1.73.64-3.72-2.7-2.56 3.7-.55z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path>
                    <ng-container *ngSwitchCase="'clock'">
                      <circle cx="12" cy="12" r="6.8" fill="none" stroke="currentColor" stroke-width="1.4"></circle>
                      <path d="M12 8v4l3 1.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path>
                    </ng-container>
                    <ng-container *ngSwitchCase="'boards'">
                      <rect x="4.5" y="6" width="15" height="12" rx="1.4" ry="1.4" fill="none" stroke="currentColor" stroke-width="1.4"></rect>
                      <line x1="4.5" y1="11.5" x2="19.5" y2="11.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></line>
                      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></line>
                    </ng-container>
                    <path *ngSwitchDefault d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path>
                  </ng-container>
                </svg>
              </span>
              <span *ngIf="isOpen; else srOnly" class="whitespace-nowrap text-sm font-medium">{{ item.label }}</span>
              <ng-template #srOnly><span class="sr-only">{{ item.label }}</span></ng-template>
            </a>
          </ng-container>
          <ng-template #staticItem>
            <button type="button" class="group flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-600 shadow-sm transition group-hover:bg-white">
                <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5">
                  <ng-container [ngSwitch]="item.icon">
                    <path *ngSwitchCase="'home'" d="M4 11.5L12 4l8 7.5v7.5h-5.5v-5.5h-5V19H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path>
                    <path *ngSwitchCase="'star'" d="M12 5.3l1.7 3.4 3.7.55-2.7 2.56.64 3.72L12 14.9l-3.34 1.73.64-3.72-2.7-2.56 3.7-.55z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path>
                    <ng-container *ngSwitchCase="'clock'">
                      <circle cx="12" cy="12" r="6.8" fill="none" stroke="currentColor" stroke-width="1.4"></circle>
                      <path d="M12 8v4l3 1.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path>
                    </ng-container>
                    <ng-container *ngSwitchCase="'boards'">
                      <rect x="4.5" y="6" width="15" height="12" rx="1.4" ry="1.4" fill="none" stroke="currentColor" stroke-width="1.4"></rect>
                      <line x1="4.5" y1="11.5" x2="19.5" y2="11.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></line>
                      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></line>
                    </ng-container>
                    <path *ngSwitchDefault d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path>
                  </ng-container>
                </svg>
              </span>
              <span *ngIf="isOpen; else srOnlyStatic" class="whitespace-nowrap text-sm font-medium">{{ item.label }}</span>
              <ng-template #srOnlyStatic><span class="sr-only">{{ item.label }}</span></ng-template>
            </button>
          </ng-template>
        </li>
      </ul>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() role: string | null = null;
  @Input() items: Array<{ label: string; icon: string; path?: string }> | null = null;

  // Build sidebar items here based on role
  get computedItems(): Array<{ label: string; icon: string; path?: string }> {
    if (this.items && this.items.length) return this.items;
    return this.buildSidebarForRole(this.role);
  }

  private buildSidebarForRole(role: string | null): Array<{ label: string; icon: string; path?: string }> {
    if (role === 'EMPLOYEE') {
      return [
        { label: 'Dashboard', icon: 'home' },
        { label: ' Attendance', icon: 'clock' },
        { label: ' Leave Requests', icon: 'star' },
        { label: ' Performance', icon: 'star' },
        { label: ' Payroll', icon: 'boards' },
        { label: 'Training & Learning', icon: 'boards' },
        { label: 'Help / Support', icon: 'boards' }
      ];
    }
    // Default/basic sidebar
    return [
      { label: 'Home', icon: 'home', path: '/' },
      { label: 'Favorites', icon: 'star' },
      { label: 'Recent', icon: 'clock' },
      { label: 'Workspaces', icon: 'boards' },
      { label: 'Modules', icon: 'boards' }
    ];
  }
}
