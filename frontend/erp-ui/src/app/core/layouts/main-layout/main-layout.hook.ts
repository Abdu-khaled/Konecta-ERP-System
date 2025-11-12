export type SidebarItem = { label: string; icon: string; path?: string; children?: Array<{ label: string; icon: string; path?: string }> };

export function buildSidebarForRole(role: string | null): SidebarItem[] {
  if (role === 'ADMIN') {
    return [
      { label: 'Dashboard', icon: 'space_dashboard', path: '/admin/dashboard' },
      { label: 'Activity Feed', icon: 'rss_feed', path: '/reports/feed' },
      { label: 'Inventory', icon: 'inventory_2', children: [
        { label: 'Dashboard', icon: 'dashboard', path: '/inventory/dashboard' },
        { label: 'Items', icon: 'list', path: '/inventory/items' },
        { label: 'Low Stock', icon: 'warning', path: '/inventory/low-stock' },
        { label: 'Movements', icon: 'swap_vert', path: '/inventory/movements' },
        { label: 'Warehouses', icon: 'warehouse', path: '/inventory/warehouses' }
      ] },
      { label: 'Manage Users & Roles', icon: 'manage_accounts', children: [
        { label: 'Invite Users', icon: 'group_add', path: '/admin/invite' },
        { label: 'Update Roles', icon: 'badge', path: '/admin/users' }
      ] },
      { label: 'System Activity Log', icon: 'history' },
      { label: 'Modules Overview', icon: 'view_module' },
      { label: 'Settings / Access Control', icon: 'settings' },
      { label: 'Audit Reports', icon: 'assignment' }
    ];
  }
  if (role === 'HR') {
    return [
      { label: 'Dashboard', icon: 'space_dashboard', path: '/hr/dashboard' },
      { label: 'Activity Feed', icon: 'rss_feed', path: '/reports/feed' },
      { label: 'Manage Employees', icon: 'group', children: [
        // Core HR actions
        { label: 'Departments', icon: 'apartment', path: '/hr/departments' },
        { label: 'Invite Users', icon: 'group_add', path: '/hr/invite' }
      ] },
      { label: 'Jobs', icon: 'work', path: '/hr/jobs' },
      { label: 'Attendance Tracking', icon: 'schedule', path: '/hr/attendance' },
      { label: 'Performance Evaluation', icon: 'workspace_premium', path: '/hr/performance' },
      { label: 'Training Management', icon: 'school', path: '/hr/training' },
      { label: 'Leave Management', icon: 'event_note', path: '/hr/leaves' },
      { label: 'Reports ', icon: 'insights' }
    ];
  }
  if (role === 'FINANCE') {
    return [
      { label: 'Dashboard', icon: 'space_dashboard', path: '/finance/dashboard' },
      { label: 'Activity Feed', icon: 'rss_feed', path: '/reports/feed' },
      { label: 'Manage Transactions', icon: 'receipt_long', children: [
        { label: 'Invoices', icon: 'request_quote', path: '/finance/invoices' },
        { label: 'Expenses', icon: 'add_card', path: '/finance/expenses' }
      ] },
      { label: 'Budget Monitoring', icon: 'monitoring', children: [
        { label: 'Departmental Budgets', icon: 'account_balance', path: '/finance/budgets' },
        { label: 'Spending Reports', icon: 'bar_chart' }
      ] },
      { label: 'Payroll Overview (HR data)', icon: 'payments', path: '/finance/payroll' },
    ];
  }
  if (role === 'EMPLOYEE') {
    return [
      { label: 'Dashboard', icon: 'home', path: '/employee/dashboard' },
      { label: 'Activity Feed', icon: 'rss_feed', path: '/reports/feed' },
      { label: 'My Attendance', icon: 'schedule', path: '/employee/my-attendance' },
      { label: 'My Leave Requests', icon: 'event_note', path: '/employee/my-leaves' },
      { label: 'My Performance', icon: 'workspace_premium', path: '/employee/my-performance' },
      { label: 'My Payroll', icon: 'request_quote', path: '/employee/my-payroll' },
      { label: 'Training & Learning', icon: 'school', path: '/employee/training' },
    ];
  }
  if (role === 'INVENTORY') {
    return [
      { label: 'Dashboard', icon: 'space_dashboard', path: '/inventory/dashboard' },
      { label: 'Activity Feed', icon: 'rss_feed', path: '/reports/feed' },
      { label: 'Items', icon: 'list', path: '/inventory/items' },
      { label: 'Low Stock', icon: 'warning', path: '/inventory/low-stock' },
      { label: 'Movements', icon: 'swap_vert', path: '/inventory/movements' },
      { label: 'Warehouses', icon: 'warehouse', path: '/inventory/warehouses' }
    ];
  }
  if (role === 'IT_OPERATION') {
    return [
      { label: 'Dashboard', icon: 'space_dashboard', path: '/itops/dashboard' },
      { label: 'Activity Feed', icon: 'rss_feed', path: '/reports/feed' },
      { label: 'Systems', icon: 'dns', path: '/itops/systems' },
      { label: 'Monitoring', icon: 'monitor_heart', path: '/itops/monitoring' },
      { label: 'Tickets', icon: 'confirmation_number', path: '/itops/tickets' }
    ];
  }
  if (role === 'OPERATIONS') {
    return [
      { label: 'Dashboard', icon: 'space_dashboard', path: '/operations/dashboard' },
      { label: 'Activity Feed', icon: 'rss_feed', path: '/reports/feed' },
      { label: 'Processes', icon: 'precision_manufacturing', path: '/operations/processes' },
      { label: 'Logistics', icon: 'local_shipping', path: '/operations/logistics' },
      { label: 'Reports', icon: 'bar_chart', path: '/operations/reports' }
    ];
  }
  if (role === 'SALES_ONLY') {
    return [
      { label: 'Dashboard', icon: 'space_dashboard', path: '/sales/dashboard' },
      { label: 'Activity Feed', icon: 'rss_feed', path: '/reports/feed' },
      { label: 'Leads', icon: 'leaderboard', path: '/sales/leads' },
      { label: 'Opportunities', icon: 'trending_up', path: '/sales/opportunities' },
      { label: 'Reports', icon: 'bar_chart', path: '/sales/reports' }
    ];
  }
  return [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Activity Feed', icon: 'rss_feed', path: '/reports/feed' },
    { label: 'Favorites', icon: 'star' },
    { label: 'Recent', icon: 'schedule' },
    { label: 'Workspaces', icon: 'dashboard' },
    { label: 'Modules', icon: 'apps' }
  ];
}
