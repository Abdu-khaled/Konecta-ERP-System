import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportingApiService } from '../../services/reporting.api.service';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, DatePipe],
  templateUrl: './activity-feed.component.html'
})
export class ActivityFeedComponent {
  private readonly api = inject(ReportingApiService);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  items = signal<any[]>([]);

  service = '';
  routingKey = '';
  since = '';
  limit = 100;

  ngOnInit() {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    this.since = d.toISOString();
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.error.set(null);
    const params: any = {};
    if (this.service) params.service = this.service;
    if (this.routingKey) params.routingKey = this.routingKey;
    if (this.since) params.since = this.since;
    if (this.limit) params.limit = this.limit;
    this.api.feed(params).subscribe({
      next: (list) => { this.items.set(list || []); this.loading.set(false); },
      error: (e) => { this.error.set(e?.message || 'Failed to load'); this.loading.set(false); }
    });
  }
}
