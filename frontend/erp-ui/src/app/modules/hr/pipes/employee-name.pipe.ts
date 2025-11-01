import { Pipe, PipeTransform, inject } from '@angular/core';
import { HrApiService } from '../services/hr.api.service';
import { firstValueFrom } from 'rxjs';

@Pipe({ name: 'employeeName', standalone: true, pure: false })
export class EmployeeNamePipe implements PipeTransform {
  private readonly hr = inject(HrApiService);
  private cache: Record<number, string> = {};
  private requested = new Set<number>();

  transform(employeeId?: number): string {
    if (employeeId == null) return '-';
    const cached = this.cache[employeeId];
    if (cached) return cached + ' (#' + employeeId + ')';
    if (!this.requested.has(employeeId)) {
      this.requested.add(employeeId);
      firstValueFrom(this.hr.listEmployees()).then((list: any[]) => {
        const e = list.find((x: any) => x.id === employeeId);
        if (e) this.cache[employeeId] = (e.firstName + ' ' + e.lastName).trim();
      }).catch(() => {});
    }
    return '#' + employeeId;
  }
}

