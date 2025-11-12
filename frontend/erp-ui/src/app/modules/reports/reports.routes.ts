import { Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';

export const reportsRoutes: Routes = [
  { path: '', component: ReportsComponent },
  { path: 'feed', component: ActivityFeedComponent }
];

