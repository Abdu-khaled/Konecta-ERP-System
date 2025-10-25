import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(message?: any, ...optionalParams: any[]): void { console.log(message, ...optionalParams); }
  warn(message?: any, ...optionalParams: any[]): void { console.warn(message, ...optionalParams); }
  error(message?: any, ...optionalParams: any[]): void { console.error(message, ...optionalParams); }
}

