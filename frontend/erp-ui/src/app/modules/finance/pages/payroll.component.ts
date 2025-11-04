import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceApiService } from '../services/finance.api.service';
import { Payroll } from '../services/finance.types';
import { EmployeeNamePipe } from '../../hr/pipes/employee-name.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { downloadExcel } from '../../../shared/helpers/excel';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { HrApiService } from '../../hr/services/hr.api.service';
import { Employee } from '../../hr/services/hr.types';

@Component({
  selector: 'app-finance-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeNamePipe],
  templateUrl: './payroll.component.html'
})
export class PayrollComponent implements OnInit {
  private readonly api = inject(FinanceApiService);
  private readonly toast = inject(ToastService);
  private readonly hr = inject(HrApiService);
  period = '';
  items: Payroll[] = [];
  error = '';

  employees: Employee[] = [];
  rows: Array<{ employeeId: number; name: string; base: number; bonuses: number; deductions: number; net: number; paid: boolean; selected?: boolean }>=[];
  bulkPaying = false;
  search = '';

  ngOnInit(): void { this.period = this.defaultPeriod(); this.load(); }

  defaultPeriod(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }

  load() {
    if (!this.period) return;
    this.error = '';
    // Load employees and existing payroll for the period, then build rows
    this.hr.listEmployees().subscribe({
      next: (emps) => {
        this.employees = emps || [];
        this.api.listPayrollByPeriod(this.period).subscribe({
          next: (pay) => {
            this.items = pay || [];
            const paidById: Record<number, Payroll> = {} as any;
            for (const p of this.items) { if (p.employeeId != null) paidById[p.employeeId] = p; }
            this.rows = (this.employees || []).map(e => {
              const p = paidById[e.id!];
              const base = (p?.baseSalary ?? e.salary ?? 0) as number;
              const bonuses = (p?.bonuses ?? 0) as number;
              const deductions = (p?.deductions ?? 0) as number;
              const net = this.calcNet(base, bonuses, deductions);
              return { employeeId: e.id!, name: `${e.firstName} ${e.lastName}`.trim(), base, bonuses, deductions, net, paid: !!p, selected: false };
            });
          },
          error: () => { this.error = 'Failed to load payroll'; this.toast.error(this.error); }
        });
      },
      error: () => { this.error = 'Failed to load employees'; this.toast.error(this.error); }
    });
  }

  calcNet(base: number, bonuses: number, deductions: number): number { return (base || 0) + (bonuses || 0) - (deductions || 0); }
  onEditRow(i: number) { const r = this.rows[i]; r.net = this.calcNet(r.base, r.bonuses, r.deductions); }
  payRow(i: number) {
    const r = this.rows[i];
    const payload = { employeeId: r.employeeId, period: this.period, baseSalary: r.base, bonuses: r.bonuses, deductions: r.deductions } as any;
    this.api.calculateAndSavePayroll(payload).subscribe({
      next: (saved) => { this.toast.success(`Paid ${r.name}`); r.paid = true; r.base = saved.baseSalary ?? r.base; r.bonuses = saved.bonuses ?? r.bonuses; r.deductions = saved.deductions ?? r.deductions; r.net = saved.netSalary ?? r.net; },
      error: () => { this.toast.error('Failed to pay'); }
    });
  }

  // Filtering & selection helpers
  get filteredRows() { const q = (this.search || '').trim().toLowerCase(); if (!q) return this.rows; return (this.rows || []).filter(r => `${r.employeeId}`.includes(q) || r.name.toLowerCase().includes(q) || (r.paid ? 'paid':'unpaid').includes(q) || `${r.base}`.includes(q) || `${r.net}`.includes(q)); }
  get anySelected(): boolean { return (this.filteredRows || []).some(r => r.selected && !r.paid); }
  get allSelected(): boolean { const src = (this.filteredRows || []).filter(r => !r.paid); return !!src.length && src.every(r => !!r.selected); }
  toggleAll(flag: boolean) { (this.filteredRows || []).forEach(r => { if (!r.paid) r.selected = !!flag; }); }
  async paySelected() {
    const toPay = (this.filteredRows || []).filter(r => r.selected && !r.paid);
    if (!toPay.length) return;
    this.bulkPaying = true;
    try {
      for (const r of toPay) {
        const payload = { employeeId: r.employeeId, period: this.period, baseSalary: r.base, bonuses: r.bonuses, deductions: r.deductions } as any;
        const saved = await firstValueFrom(this.api.calculateAndSavePayroll(payload));
        r.paid = true; r.base = saved.baseSalary ?? r.base; r.bonuses = saved.bonuses ?? r.bonuses; r.deductions = saved.deductions ?? r.deductions; r.net = saved.netSalary ?? r.net; r.selected = false;
      }
      this.toast.success(`Paid ${toPay.length} user(s)`);
    } catch (e) {
      this.toast.error('Failed to pay selected');
    } finally {
      this.bulkPaying = false;
    }
  }

  // Import from Excel to prefill Base/Bonuses/Deductions
  async importFromFile(file?: File | null) {
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      let updated = 0, skipped = 0;
      for (const r of rows) {
        const idRaw = r['EmployeeId'] ?? r['ID'] ?? r['Id'];
        const email = (r['Email'] ?? r['email'] ?? '').toString().trim();
        const name = (r['Name'] ?? r['User'] ?? r['Employee'] ?? '').toString().trim();
        let target: typeof this.rows[number] | undefined;
        const idNum = Number(idRaw);
        if (idRaw != null && !Number.isNaN(idNum)) target = (this.rows || []).find(x => x.employeeId === idNum);
        if (!target && email) {
          const emp = (this.employees || []).find(e => (e.email || '').toLowerCase() === email.toLowerCase());
          if (emp) target = (this.rows || []).find(x => x.employeeId === emp.id);
        }
        if (!target && name) target = (this.rows || []).find(x => x.name.toLowerCase() === name.toLowerCase());
        if (!target || target.paid) { skipped++; continue; }
        const base = r['Base'] ?? r['Base Salary'] ?? r['BaseSalary'];
        const bonuses = r['Bonuses'] ?? r['Bonus'];
        const deductions = r['Deductions'] ?? r['Deduction'];
        if (base !== '' && base != null) target.base = Number(base) || 0;
        if (bonuses !== '' && bonuses != null) target.bonuses = Number(bonuses) || 0;
        if (deductions !== '' && deductions != null) target.deductions = Number(deductions) || 0;
        target.net = this.calcNet(target.base, target.bonuses, target.deductions);
        target.selected = true;
        updated++;
      }
      this.toast.success(`Imported ${updated} row(s)`);
      if (skipped) this.toast.info(`${skipped} row(s) skipped`);
    } catch {
      this.toast.error('Failed to import file');
    }
  }
  download() {
    const cols = [
      { key: 'employeeId', header: 'Employee ID' },
      { key: 'name', header: 'Name' },
      { key: 'base', header: 'Base Salary' },
      { key: 'bonuses', header: 'Bonuses' },
      { key: 'deductions', header: 'Deductions' },
      { key: 'net', header: 'Net Salary' },
      { key: 'status', header: 'Status', transform: (_: any, r: any) => (r.paid ? 'PAID' : 'UNPAID') }
    ] as any;
    downloadExcel(`payroll_${this.period || 'period'}.xlsx`, cols, this.filteredRows || []);
  }
}






