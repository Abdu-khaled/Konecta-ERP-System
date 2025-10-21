import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavThemeService {
  private brandSubject = new BehaviorSubject<boolean>(false);
  readonly isBrand$ = this.brandSubject.asObservable();

  setBrand(isBrand: boolean) {
    this.brandSubject.next(!!isBrand);
  }
}

