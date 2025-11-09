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
    const list = (this.items && this.items.length ? [...this.items] : this.buildSidebarForRole(this.role)) || [];
    // Ensure a top-level Dashboard button for all roles
    const dashPath = this.dashboardPath(this.role);
    if (dashPath) {
      const hasDash = list.some(i => (i.path === dashPath) || (i.label?.toLowerCase() === 'dashboard'));
      if (!hasDash) list.unshift({ label: 'Dashboard', icon: 'space_dashboard', path: dashPath });
    }
    return list;
  }

  // Exposed for template to render a guaranteed dashboard link at the very top
  get dashPath(): string | null { return this.dashboardPath(this.role); }

  private dashboardPath(role: string | null | undefined): string | null {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'HR': return '/hr/dashboard';
      case 'FINANCE': return '/finance/dashboard';
      case 'EMPLOYEE': return '/employee/dashboard';
      case 'INVENTORY': return '/inventory/dashboard';
      default: return null;
    }
  }

  private buildSidebarForRole(role: string | null): Array<{ label: string; icon: string; path?: string; children?: Array<{ label: string; icon: string; path?: string }> }> {
    if (role === 'ADMIN') {
      return [
        { label: 'Dashboard', icon: 'space_dashboard', path: '/admin/dashboard' },
        { label: 'Manage Users & Roles', icon: 'manage_accounts', children: [
          { label: 'Invite Users', icon: 'group_add', path: '/admin/invite' },
          { label: 'Assign Roles', icon: 'badge' }
        ]},
        { label: 'System Activity Log', icon: 'history' },
        { label: 'Modules Overview', icon: 'view_module' },
        { label: 'Settings / Access Control', icon: 'settings' },
        { label: 'Audit Reports', icon: 'assignment' },
        { label: 'Reports', icon: 'insights', path: '/reports' }
      ];
    }
    if (role === 'HR') {
      return [
        { label: 'Dashboard', icon: 'space_dashboard', path: '/hr/dashboard' },
        { label: 'Manage Employees', icon: 'group', children: [
          { label: 'Departments', icon: 'apartment', path: '/hr/departments' },
          { label: 'Invite Users', icon: 'group_add', path: '/hr/invite' }
        ]},
        { label: 'Jobs', icon: 'work', path: '/hr/jobs' },
        { label: 'Attendance Tracking', icon: 'schedule', path: '/hr/attendance' },
        { label: 'Performance Evaluation', icon: 'workspace_premium', path: '/hr/performance' },
        { label: 'Training Management', icon: 'school', path: '/hr/training' },
        { label: 'Leave Management', icon: 'event_note', path: '/hr/leaves' },
        { label: 'Reports (HR Analytics)', icon: 'insights', path: '/reports' }
      ];
    }
    if (role === 'FINANCE') {
      return [
        { label: 'Dashboard', icon: 'space_dashboard', path: '/finance/dashboard' },
        { label: 'Manage Transactions', icon: 'receipt_long', children: [
          { label: 'Invoices', icon: 'request_quote', path: '/finance/invoices' },
          { label: 'Expenses', icon: 'add_card', path: '/finance/expenses' }
        ]},
        { label: 'Budget Monitoring', icon: 'monitoring', children: [
          { label: 'Departmental Budgets', icon: 'account_balance', path: '/finance/budgets' },
          { label: 'Spending Reports', icon: 'bar_chart' }
        ]},
        { label: 'Payroll Overview (HR data)', icon: 'payments', path: '/finance/payroll' },
        { label: 'Forecasting (AI Integration)', icon: 'trending_up' },
        { label: 'Reports', icon: 'insights', path: '/reports' }
      ];
    }
    if (role === 'EMPLOYEE') {
      return [
        { label: 'Dashboard', icon: 'home', path: '/employee/dashboard' },
        { label: 'My Attendance', icon: 'schedule', path: '/employee/my-attendance' },
        { label: 'My Leave Requests', icon: 'event_note', path: '/employee/my-leaves' },
        { label: 'My Performance', icon: 'workspace_premium', path: '/employee/my-performance' },
        { label: 'My Payroll', icon: 'request_quote', path: '/employee/my-payroll' },
        { label: 'Training & Learning', icon: 'school', path: '/employee/training' },
        { label: 'Help / Support', icon: 'support_agent' }
      ];
    }
    if (role === 'MANAGER') {
      return [
        { label: 'Dashboard', icon: 'space_dashboard', path: '/reports' },
        { label: 'Reports', icon: 'insights', path: '/reports' }
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
