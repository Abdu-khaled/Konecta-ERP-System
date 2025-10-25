import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../helpers/storage-keys';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEYS.authToken) || sessionStorage.getItem(STORAGE_KEYS.authToken);
  }
  set(token: string, remember: boolean): void {
    this.clear();
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEYS.authToken, token);
  }
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.authToken);
    sessionStorage.removeItem(STORAGE_KEYS.authToken);
  }
}

