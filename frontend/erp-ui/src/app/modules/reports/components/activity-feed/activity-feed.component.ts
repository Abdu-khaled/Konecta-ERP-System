import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportingFeedService, CreateActivityEventDto, ActivityEventDto } from '../../../../core/services/reporting-feed.service';
import { HrApiService } from '../../../hr/services/hr.api.service';
import { JobsApiService } from '../../../hr/services/jobs.api.service';
import { InventoryApiService } from '../../../inventory/services/inventory.api.service';
import { AuthState } from '../../../../core/services/auth-state.service';
import { FinanceApiService } from '../../../finance/services/finance.api.service';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  templateUrl: './activity-feed.component.html'
})
export class ActivityFeedComponent {
  private readonly api = inject(ReportingFeedService);
  private readonly hr = inject(HrApiService);
  private readonly jobsApi = inject(JobsApiService);
  private readonly auth = inject(AuthState);
  private readonly fin = inject(FinanceApiService);
  private readonly inv = inject(InventoryApiService);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  availableRoles = ['ADMIN','MANAGER','HR','FINANCE','EMPLOYEE','INVENTORY','IT_OPERATION','SALES_ONLY','OPERATIONS'];

  // Share Data panel state
  shareOpen = false;
  dataType: 'employees' | 'departments' | 'jobs' | 'invoices' | 'expenses' | 'payroll' | 'items' = 'employees';
  dataItems: any[] = [];
  receivedItems: ActivityEventDto[] = [];
  viewOpen = false;
  viewItem: ActivityEventDto | null = null;
  viewType: string | null = null;
  viewFields: string[] = [];
  viewRows: any[] = [];
  selectedIds = new Set<number>();
  fieldsConfig: Record<string, { key: string; label: string }[]> = {
    employees: [
      { key: 'id', label: 'ID' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'accountMasked', label: 'Account' },
      { key: 'departmentName', label: 'Department' },
      { key: 'position', label: 'Position' },
      { key: 'salary', label: 'Salary' },
      { key: 'workingHours', label: 'Working Hours' }
    ],
    invoices: [
      { key: 'id', label: 'ID' },
      { key: 'clientName', label: 'Client' },
      { key: 'invoiceDate', label: 'Date' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
      { key: 'grandTotal', label: 'Grand Total' }
    ],
    expenses: [
      { key: 'id', label: 'ID' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
      { key: 'department', label: 'Department' },
      { key: 'expenseDate', label: 'Date' }
    ],
    payroll: [
      { key: 'id', label: 'ID' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'period', label: 'Period' },
      { key: 'baseSalary', label: 'Base Salary' },
      { key: 'bonuses', label: 'Bonuses' },
      { key: 'deductions', label: 'Deductions' },
      { key: 'netSalary', label: 'Net Salary' }
    ],
    items: [
      { key: 'id', label: 'ID' },
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Name' },
      { key: 'unit', label: 'Unit' },
      { key: 'quantity', label: 'On-hand' },
      { key: 'reorderLevel', label: 'Reorder Level' }
    ],
    departments: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' }
    ],
    jobs: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'departmentId', label: 'Department ID' },
      { key: 'location', label: 'Location' },
      { key: 'employmentType', label: 'Type' },
      { key: 'status', label: 'Status' }
    ]
  };
  selectedFields: string[] = ['id', 'firstName', 'lastName', 'email', 'departmentName'];
  shareRoles: string[] = [];
  sharePushNow = true;
  role: string | null = this.auth.profile?.role || null;
  ngOnInit() { this.loadReceived(); }

  // Share Data helpers
  toggleShare() {
    this.shareOpen = !this.shareOpen;
    if (this.shareOpen) {
      // Initialize with a sensible default dataset per role
      const dt = this.defaultDataTypeForRole();
      this.dataType = dt as any;
      const cols = (this.fieldsConfig[this.dataType] || []).map(f => f.key);
      this.selectedFields = cols.slice(0, Math.min(4, cols.length));
      this.dataItems = [];
      this.selectedIds.clear();
      this.shareRoles = [];
      this.sharePushNow = true;
    } else {
      this.dataItems = [];
      this.selectedIds.clear();
      this.selectedFields = ['id'];
      this.shareRoles = [];
      // Reset to default type next open
      this.dataType = this.defaultDataTypeForRole();
      this.sharePushNow = true;
    }
  }

  private defaultDataTypeForRole(): any {
    const r = (this.role || '').toUpperCase();
    if (r === 'HR') return 'employees';
    if (r === 'FINANCE') return 'invoices';
    if (r === 'INVENTORY' || r === 'ADMIN') return 'items';
    return 'employees';
  }

  loadData() {
    this.dataItems = [];
    this.selectedIds.clear();
    if (!this.isDataTypeAllowed(this.dataType)) {
      this.error.set('This data type is not available for your role.');
      return;
    }
    if (this.dataType === 'employees') {
      this.hr.listEmployees().subscribe({ next: (res) => this.dataItems = res || [], error: () => this.dataItems = [] });
      this.selectedFields = ['id','firstName','lastName','email','departmentName'];
      // After employees load, attempt to enrich with finance accounts
      setTimeout(() => this.enrichAccountsForEmployees(), 0);
    } else if (this.dataType === 'departments') {
      this.hr.listDepartments().subscribe({ next: (res) => this.dataItems = res || [], error: () => this.dataItems = [] });
      this.selectedFields = ['id','name'];
    } else if (this.dataType === 'jobs') {
      this.jobsApi.listJobs().subscribe({ next: (res) => this.dataItems = res || [], error: () => this.dataItems = [] });
      this.selectedFields = ['id','title','departmentId'];
    } else if (this.dataType === 'invoices') {
      this.fin.listInvoices().subscribe({ next: (res: any[]) => this.dataItems = res || [], error: () => this.dataItems = [] });
      this.selectedFields = ['id','clientName','invoiceDate','amount','status'];
    } else if (this.dataType === 'expenses') {
      this.fin.listExpenses().subscribe({ next: (res: any[]) => this.dataItems = res || [], error: () => this.dataItems = [] });
      this.selectedFields = ['id','category','amount','status','department','expenseDate'];
    } else if (this.dataType === 'payroll') {
      // Get recent period overview (current month)
      const d = new Date();
      const period = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      this.fin.listPayrollByPeriod(period).subscribe({ next: (res: any[]) => this.dataItems = res || [], error: () => this.dataItems = [] });
      this.selectedFields = ['id','employeeId','period','netSalary'];
    } else if (this.dataType === 'items') {
      this.inv.listItems().subscribe({ next: (res: any[]) => this.dataItems = res || [], error: () => this.dataItems = [] });
      this.selectedFields = ['id','sku','name','unit','quantity','reorderLevel'];
    }
  }

  toggleRow(id: number, checked: boolean) {
    if (checked) this.selectedIds.add(id); else this.selectedIds.delete(id);
  }

  onFieldToggle(key: string, checked: boolean) {
    if (checked) { if (!this.selectedFields.includes(key)) this.selectedFields.push(key); }
    else { this.selectedFields = this.selectedFields.filter(x => x !== key); }
  }

  displayFields() { return (this.fieldsConfig[this.dataType] || []).filter(f => this.selectedFields.includes(f.key)); }

  isDataTypeAllowed(type: string): boolean {
    const r = (this.role || '').toUpperCase();
    if (r === 'HR') return ['employees','departments','jobs'].includes(type);
    if (r === 'FINANCE') return ['invoices','expenses','payroll'].includes(type);
    if (r === 'INVENTORY' || r === 'ADMIN') return ['items'].includes(type);
    return false;
  }

  onTypeChange(val: any) {
    // Reset fields for the selected type to a sensible default (first 4 columns)
    const cols = (this.fieldsConfig[val] || []).map(f => f.key);
    this.selectedFields = cols.slice(0, Math.min(4, cols.length));
    this.dataItems = [];
    this.selectedIds.clear();
  }

  private maskAccount(acc?: string | null): string | null {
    const s = (acc || '').replace(/\s+/g, '');
    if (!s) return null;
    const last4 = s.slice(-4);
    return `**** **** **** ${last4}`;
  }

  private enrichAccountsForEmployees() {
    try {
      const emails = (this.dataItems || []).map((e: any) => (e.email || '').toString()).filter((x: string) => !!x);
      if (!emails.length) return;
      this.fin.accountsByEmails(emails).subscribe({
        next: (list: any[]) => {
          const map: Record<string, any> = {};
          (list || []).forEach(a => { if (a?.email) map[String(a.email).toLowerCase()] = a; });
          this.dataItems = (this.dataItems || []).map((e: any) => {
            const key = String(e.email || '').toLowerCase();
            const acc = map[key]?.accountNumber || null;
            return { ...e, accountMasked: this.maskAccount(acc) };
          });
        },
        error: () => {
          // If not authorized, quietly skip accounts
          this.dataItems = (this.dataItems || []).map((e: any) => ({ ...e, accountMasked: null }));
        }
      });
    } catch { /* ignore */ }
  }

  private loadReceived() {
    // Recent shares addressed to current role only
    const role = (this.role || undefined) as any;
    this.api.getFeed({ status: 'pushed', role, limit: 20 }).subscribe({ next: (res) => this.receivedItems = res || [], error: () => this.receivedItems = [] });
  }

  openView(it: ActivityEventDto) {
    this.viewItem = it;
    this.viewOpen = true;
    this.viewType = null; this.viewFields = []; this.viewRows = [];
    try {
      const data = JSON.parse(it.payload || '{}');
      const fields = Array.isArray(data.fields) ? data.fields.filter((f: any) => typeof f === 'string') : [];
      const rows = Array.isArray(data.rows) ? data.rows : [];
      this.viewType = typeof data.type === 'string' ? data.type : null;
      this.viewFields = fields;
      this.viewRows = rows;
    } catch {
      // Leave as empty; template will show raw payload if needed
      this.viewType = null;
      this.viewFields = [];
      this.viewRows = [];
    }
  }

  closeView() { this.viewOpen = false; this.viewItem = null; }

  shareSelectedData() {
    if (!this.dataItems.length) { this.error.set('Load data first.'); return; }
    const rows = this.dataItems.filter((it: any) => it && this.selectedIds.has((it.id || 0))).map((it: any) => {
      const row: any = {};
      this.selectedFields.forEach(k => row[k] = (it as any)[k]);
      return row;
    });
    if (!rows.length) { this.error.set('Select at least one row.'); return; }
    if (!this.shareRoles.length) { this.error.set('Select target roles.'); return; }
    const payload = JSON.stringify({ type: this.dataType, fields: this.selectedFields, rows });
    const title = `Shared ${this.dataType} (${rows.length})`;
    const summary = `Shared ${rows.length} ${this.dataType} to roles: ${this.shareRoles.join(', ')}`;
    this.loading.set(true);
    let remaining = this.shareRoles.length;
    const done = () => { if (--remaining <= 0) { this.loading.set(false); } };
    this.shareRoles.forEach(r => {
      const dto: CreateActivityEventDto = {
        service: 'manual',
        routingKey: `manual.share.${this.dataType}`,
        role: r,
        title,
        summary,
        action: 'shared',
        entityType: this.dataType,
        payload,
        status: this.sharePushNow ? 'pushed' : 'draft'
      };
      this.api.create(dto).subscribe({ next: () => done(), error: () => done() });
    });
    this.toggleShare();
  }

  openPreviewSelected() {
    if (!this.dataItems.length) return;
    const rows = this.dataItems.filter((it: any) => it && this.selectedIds.has((it.id || 0))).map((it: any) => {
      const row: any = {};
      this.selectedFields.forEach(k => row[k] = (it as any)[k]);
      return row;
    });
    this.viewItem = { id: 0, service: 'manual', routingKey: 'preview', payload: JSON.stringify({ type: this.dataType, fields: this.selectedFields, rows }), createdAt: new Date().toISOString() } as any;
    this.viewFields = [...this.selectedFields];
    this.viewRows = rows;
    this.viewOpen = true;
  }

  onShareRoleToggle(r: string, checked: boolean) {
    if (checked) {
      if (!this.shareRoles.includes(r)) this.shareRoles.push(r);
    } else {
      this.shareRoles = this.shareRoles.filter(x => x !== r);
    }
  }
}
