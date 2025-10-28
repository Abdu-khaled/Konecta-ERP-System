import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _pending = signal(0);
  readonly pending = computed(() => this._pending());
  readonly active = computed(() => this._pending() > 0);

  push() { this._pending.update(v => v + 1); }
  pop() { this._pending.update(v => Math.max(0, v - 1)); }
}

