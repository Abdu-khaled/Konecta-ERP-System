import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatDate', standalone: true })
export class FormatDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    const d = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d);
  }
}

