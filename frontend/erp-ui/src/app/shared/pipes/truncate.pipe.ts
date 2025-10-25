import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, length = 100): string {
    if (!value) return '';
    return value.length > length ? value.slice(0, length) + '…' : value;
  }
}

