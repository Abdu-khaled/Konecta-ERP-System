import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrApiService } from '../services/hr.api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Employee } from '../services/hr.types';

@Component({
  selector: 'app-hr-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance.component.html'
})
export class PerformanceComponent implements OnInit {
  private readonly api = inject(HrApiService);
  private readonly toast = inject(ToastService);
  employees: Employee[] = [];
  selectedEmployeeId: number | null = null;
  items: any[] = [];
  error = '';
  model = { rating: 3, feedback: '', reviewDate: '' };

  ngOnInit(): void { this.api.listEmployees().subscribe({ next: e => this.employees = e }); }
  load() { if (!this.selectedEmployeeId) return; this.api.listPerformanceByEmployee(this.selectedEmployeeId).subscribe({ next: d => this.items = d, error: () => this.error = 'Failed to load performance' }); }
  submit() {
    if (!this.selectedEmployeeId) return; const payload = { employeeId: this.selectedEmployeeId, ...this.model };
    this.api.createPerformance(payload).subscribe({ next: () => { this.toast.success('Review added'); this.model = { rating: 3, feedback: '', reviewDate: '' }; this.load(); }, error: () => { this.error = 'Failed to add review'; this.toast.error(this.error); } });
  }
}
