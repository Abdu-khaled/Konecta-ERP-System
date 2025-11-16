import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initResponsiveTables } from './app/shared/helpers/responsive-tables';

bootstrapApplication(AppComponent, appConfig)
  .then(() => { try { setTimeout(() => initResponsiveTables()); } catch {} })
  .catch((err) => console.error(err));
