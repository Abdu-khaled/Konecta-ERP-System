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
        <li *ngFor="let item of computedItems; let i = index">
          <!-- Parent with link (no children) -->
          <ng-container *ngIf="item.path && !item.children; else nonLinkItem">
            <a
              class="group flex items-center gap-2.5 rounded-2xl px-2.5 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
              [routerLink]="item.path"
              routerLinkActive="bg-white text-slate-900 shadow-sm"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-700 shadow-sm transition group-hover:bg-white">
                <span class="material-symbols-outlined text-[20px]">
                  {{ materialIcon(item.icon) }}
                </span>
              </span>
              <span *ngIf="isOpen; else srOnly" class="whitespace-nowrap text-sm font-medium">{{ item.label }}</span>
              <ng-template #srOnly><span class="sr-only">{{ item.label }}</span></ng-template>
            </a>
          </ng-container>
          <!-- Non-link items: either placeholders or groups -->
          <ng-template #nonLinkItem>
            <button type="button" class="group flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                    (click)="item.children ? toggleGroup(i) : null" [attr.aria-expanded]="item.children ? isExpanded(i) : null">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-700 shadow-sm transition group-hover:bg-white">
                <span class="material-symbols-outlined text-[20px]">
                  {{ materialIcon(item.icon) }}
                </span>
              </span>
              <span *ngIf="isOpen; else srOnlyStatic" class="whitespace-nowrap text-sm font-medium">{{ item.label }}</span>
              <ng-template #srOnlyStatic><span class="sr-only">{{ item.label }}</span></ng-template>
              <span *ngIf="isOpen && item.children" class="material-symbols-outlined ml-auto text-[18px] transition-transform"
                    [ngClass]="{ '-rotate-180': isExpanded(i) }">expand_more</span>
            </button>
            <!-- Children -->
            <ul *ngIf="item.children && isExpanded(i) && isOpen" class="mt-1 ml-11 flex flex-col gap-1">
              <li *ngFor="let child of item.children">
                <ng-container *ngIf="child.path; else nonLinkChild">
                  <a
                    class="group flex w-full items-center gap-2 rounded-2xl px-2 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
                    [routerLink]="child.path"
                    routerLinkActive="bg-white text-slate-900 shadow-sm"
                    [routerLinkActiveOptions]="{ exact: true }"
                  >
                    <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-slate-700 shadow-sm">
                      <span class="material-symbols-outlined text-[18px]">{{ materialIcon(child.icon) }}</span>
                    </span>
                    <span class="whitespace-nowrap text-sm">{{ child.label }}</span>
                  </a>
                </ng-container>
                <ng-template #nonLinkChild>
                  <button type="button" class="group flex w-full items-center gap-2 rounded-2xl px-2 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
                    <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-slate-700 shadow-sm">
                      <span class="material-symbols-outlined text-[18px]">{{ materialIcon(child.icon) }}</span>
                    </span>
                    <span class="whitespace-nowrap text-sm">{{ child.label }}</span>
                  </button>
                </ng-template>
              </li>
            </ul>
          </ng-template>
        </li>
      </ul>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() role: string | null = null;
  @Input() items: Array<{ label: string; icon: string; path?: string; children?: Array<{ label: string; icon: string; path?: string }> }> | null = null;

  // Build sidebar items here based on role
  get computedItems(): Array<{ label: string; icon: string; path?: string; children?: Array<{ label: string; icon: string; path?: string }> }> {
    if (this.items && this.items.length) return this.items;
    return this.buildSidebarForRole(this.role);
  }

  private buildSidebarForRole(role: string | null): Array<{ label: string; icon: string; path?: string; children?: Array<{ label: string; icon: string; path?: string }> }> {
    if (role === 'IT' || role === 'OPERATIONS' || role === 'IT_OPS') {
      return [
        { label: 'Dashboard', icon: 'space_dashboard', path: '/it' },
        { label: 'System Monitoring', icon: 'monitoring', children: [
          { label: 'Service Status', icon: 'monitoring' },
          { label: 'Network / Cloud Health', icon: 'cloud' }
        ]},
        { label: 'Access Requests', icon: 'vpn_key', children: [
          { label: 'Approve New Logins / Devices', icon: 'devices' }
        ]},
        { label: 'Maintenance Logs', icon: 'construction' },
        { label: 'Incident Reports', icon: 'report' },
        { label: 'Backup & Recovery', icon: 'backup' },
        { label: 'Cloud Costs Overview', icon: 'savings' },
      ];
    }
    if (role === 'ADMIN') {
      return [
        { label: 'Dashboard Overview', icon: 'space_dashboard' },
        { label: 'Manage Users & Roles', icon: 'manage_accounts', children: [
          { label: 'Add / Remove Users', icon: 'group_add' },
          { label: 'Assign Roles', icon: 'badge' }
        ]},
        { label: 'System Activity Log', icon: 'history' },
        { label: 'Modules Overview', icon: 'view_module' },
        { label: 'Settings / Access Control', icon: 'settings' },
        { label: 'Audit Reports', icon: 'assignment' }
      ];
    }
    if (role === 'EMPLOYEE') {
      return [
        { label: 'Dashboard', icon: 'home' },
        { label: 'My Attendance', icon: 'schedule' },
        { label: 'My Leave Requests', icon: 'event_note' },
        { label: 'My Performance', icon: 'workspace_premium' },
        { label: 'My Payroll', icon: 'request_quote' },
        { label: 'Training & Learning', icon: 'school' },
        { label: 'Help / Support', icon: 'support_agent' }
      ];
    }
    // Default/basic sidebar
    return [
      { label: 'Home', icon: 'home', path: '/' },
      { label: 'Favorites', icon: 'star' },
      { label: 'Recent', icon: 'schedule' },
      { label: 'Workspaces', icon: 'dashboard' },
      { label: 'Modules', icon: 'apps' }
    ];
  }

  materialIcon(icon?: string | null): string {
    const k = (icon || '').toLowerCase();
    // Already mapped to Material names above; keep fallback mapping
    switch (k) {
      case 'home': return 'home';
      case 'space_dashboard': return 'space_dashboard';
      case 'manage_accounts': return 'manage_accounts';
      case 'group_add': return 'group_add';
      case 'badge': return 'badge';
      case 'history': return 'history';
      case 'view_module': return 'view_module';
      case 'settings': return 'settings';
      case 'assignment': return 'assignment';
      case 'clock': return 'schedule';
      case 'star': return 'star';
      case 'boards': return 'dashboard';
      default: return k || 'apps';
    }
  }

  private expanded = new Set<number>();
  isExpanded(i: number): boolean { return this.expanded.has(i); }
  toggleGroup(i: number): void {
    if (this.expanded.has(i)) this.expanded.delete(i); else this.expanded.add(i);
  }
}
