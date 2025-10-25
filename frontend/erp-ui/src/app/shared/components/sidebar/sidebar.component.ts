import { Component, Input } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
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

