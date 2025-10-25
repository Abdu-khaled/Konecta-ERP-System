export type SidebarItem = { label: string; icon: string; path?: string; children?: Array<{ label: string; icon: string; path?: string }> };

export function buildSidebarForRole(role: string | null): SidebarItem[] {
  if (role === 'ADMIN') {
    return [
      { label: 'Dashboard Overview', icon: 'space_dashboard' },
      { label: 'Manage Users & Roles', icon: 'manage_accounts', children: [
        { label: 'Add / Remove Users', icon: 'group_add' },
        { label: 'Assign Roles', icon: 'badge' }
      ] },
      { label: 'System Activity Log', icon: 'history' },
      { label: 'Modules Overview', icon: 'view_module' },
      { label: 'Settings / Access Control', icon: 'settings' },
      { label: 'Audit Reports', icon: 'assignment' }
    ];
  }
  if (role === 'HR') {
    return [
      { label: 'Dashboard', icon: 'space_dashboard' },
      { label: 'Manage Employees', icon: 'group', children: [
        { label: 'Add Employee', icon: 'person_add' },
        { label: 'Update / Delete Employee', icon: 'edit' }
      ] },
      { label: 'Attendance Tracking', icon: 'schedule' },
      { label: 'Performance Evaluation', icon: 'workspace_premium' },
      { label: 'Training Management', icon: 'school' },
      { label: 'Leave Management', icon: 'event_note' },
      { label: 'Reports (HR Analytics)', icon: 'insights' }
    ];
  }
  if (role === 'FINANCE') {
    return [
      { label: 'Dashboard', icon: 'space_dashboard' },
      { label: 'Manage Transactions', icon: 'receipt_long', children: [
        { label: 'Add / Approve Expenses', icon: 'add_card' },
        { label: 'View All Invoices', icon: 'request_quote' }
      ] },
      { label: 'Budget Monitoring', icon: 'monitoring', children: [
        { label: 'Departmental Budgets', icon: 'account_balance' },
        { label: 'Spending Reports', icon: 'bar_chart' }
      ] },
      { label: 'Payroll Overview (HR data)', icon: 'payments' },
      { label: 'Forecasting (AI Integration)', icon: 'trending_up' }
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
  return [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Favorites', icon: 'star' },
    { label: 'Recent', icon: 'schedule' },
    { label: 'Workspaces', icon: 'dashboard' },
    { label: 'Modules', icon: 'apps' }
  ];
}

