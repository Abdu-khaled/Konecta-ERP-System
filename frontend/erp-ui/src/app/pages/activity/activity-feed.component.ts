import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportingFeedService, ActivityEventDto, MonthlySummaryItem } from '../../core/services/reporting-feed.service';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4 space-y-4">
    <h1 class="text-xl font-semibold">Activity Feed</h1>

    <form class="grid grid-cols-2 md:grid-cols-6 gap-2 items-end" (ngSubmit)="reload()">
      <div>
        <label class="text-xs">Role</label>
        <input class="input" [(ngModel)]="filters.role" name="role" placeholder="HR" />
      </div>
      <div>
        <label class="text-xs">Service</label>
        <input class="input" [(ngModel)]="filters.service" name="service" placeholder="hr-service" />
      </div>
      <div>
        <label class="text-xs">Status</label>
        <select class="input" [(ngModel)]="filters.status" name="status">
          <option value="">Any</option>
          <option>pushed</option>
          <option>draft</option>
        </select>
      </div>
      <div>
        <label class="text-xs">Month</label>
        <input class="input" [(ngModel)]="filters.month" name="month" placeholder="2025-11" />
      </div>
      <div>
        <label class="text-xs">Limit</label>
        <input class="input" [(ngModel)]="filters.limit" name="limit" type="number" min="1" max="500" />
      </div>
      <div>
        <button class="btn" type="submit">Apply</button>
      </div>
    </form>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2 space-y-2">
        <div *ngFor="let e of events" class="border rounded p-3">
          <div class="text-sm text-gray-500">{{e.createdAt | date:'short'}} — {{e.role || e.service}} — {{e.action}}</div>
          <div class="font-medium">{{e.title || e.routingKey}}</div>
          <div class="text-sm">{{e.summary}}</div>
          <div class="text-xs text-gray-500">Status: {{e.status || 'pushed'}} | {{e.entityType}} {{e.entityId}}</div>
          <button *ngIf="e.status==='draft'" class="btn btn-primary mt-2" (click)="push(e)">Push</button>
        </div>
      </div>
      <div>
        <h2 class="font-semibold mb-2">Monthly Summary</h2>
        <div *ngFor="let s of summary" class="border rounded p-3 mb-2">
          <div class="text-sm">{{s.month}} — {{s.role}} — {{s.action}}</div>
          <div class="text-2xl font-bold">{{s.count}}</div>
          <div class="text-xs text-gray-500">latest {{s.latestAt | date:'short'}}</div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ActivityFeedComponent implements OnInit {
  private readonly api = inject(ReportingFeedService);

  events: ActivityEventDto[] = [];
  summary: MonthlySummaryItem[] = [];

  filters: any = { limit: 50 };

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.api.getFeed(this.filters).subscribe(res => this.events = res);
    this.api.monthly(this.filters.month).subscribe(res => this.summary = res);
  }

  push(e: ActivityEventDto) {
    this.api.push(e.id).subscribe(updated => {
      e.status = updated.status;
    });
  }
}
