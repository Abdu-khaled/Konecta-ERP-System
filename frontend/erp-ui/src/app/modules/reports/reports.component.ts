import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportingApiService } from './services/reporting.api.service';
import { DashboardAnalyticsDto, ExportFormat, ReportRequest } from './services/reporting.types';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, DatePipe, FormsModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  private readonly api = inject(ReportingApiService);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  data = signal<DashboardAnalyticsDto | null>(null);

  // Filters
  period = signal<string>(''); // e.g. 2025-01
  periodVal = '';
  startDateVal = '';
  endDateVal = '';

  ngOnInit() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.error.set(null);
    // Sync signal for period to keep export helpers using this.period()
    this.period.set(this.periodVal?.trim() || '');
    const params: any = {};
    if (this.periodVal) params.period = this.periodVal;
    if (this.startDateVal) params.startDate = this.startDateVal;
    if (this.endDateVal) params.endDate = this.endDateVal;
    this.api.getDashboard(params).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(e?.message || 'Failed to load'); this.loading.set(false); }
    });
  }

  exportPayroll(format: ExportFormat) {
    const period = this.period() || this.inferCurrentPeriod();
    const payload: ReportRequest = { type: 'PayrollSummary', format, period };
    this.download(payload);
  }

  exportAttendance(format: ExportFormat) {
    const payload: ReportRequest = {
      type: 'AttendanceReport',
      format,
      startDate: this.startDateVal || this.defaultStartDate(),
      endDate: this.endDateVal || this.defaultEndDate()
    };
    this.download(payload);
  }

  exportFinancial(format: ExportFormat) {
    const payload: ReportRequest = {
      type: 'FinancialSummary',
      format,
      startDate: this.startDateVal || this.defaultStartDate(),
      endDate: this.endDateVal || this.defaultEndDate()
    };
    this.download(payload);
  }

  private download(payload: ReportRequest) {
    this.loading.set(true);
    this.api.exportReport(payload).subscribe({
      next: ({ fileName, blob }) => {
        this.loading.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => { this.loading.set(false); this.error.set(e?.message || 'Export failed'); }
    });
  }

  private inferCurrentPeriod(): string {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  }

  private defaultStartDate(): string {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    // date-only string is fine for backend (model binding)
    return d.toISOString().slice(0, 10);
  }
  private defaultEndDate(): string { return new Date().toISOString().slice(0, 10); }
}
