import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="loading.active()" class="fixed left-0 right-0 top-0 z-[100] h-1 bg-primary-600 animate-pulse"></div>
  `
})
export class LoadingBarComponent {
  readonly loading = inject(LoadingService);
}

