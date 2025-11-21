import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  // Ensure chatbot URL is available at runtime even if env.js/app-config.js order is off
  constructor() {
    const w: any = (globalThis as any) || {};
    w.__APP_CONFIG__ = w.__APP_CONFIG__ || {};
    const fromConfig = w.__APP_CONFIG__.chatbotUrl as string | undefined;
    const fromEnv = (w.__ENV__?.CHATBOT_URL || w.ENV?.CHATBOT_URL) as string | undefined;
    let fromLS = '';
    try { fromLS = localStorage.getItem('CHATBOT_URL') || ''; } catch {}
    const preferEnv = fromEnv && fromEnv.startsWith('/') ? fromEnv : undefined; // prefer same-origin proxy
    if (preferEnv) w.__APP_CONFIG__.chatbotUrl = preferEnv;
    else if (!fromConfig && (fromEnv || fromLS)) w.__APP_CONFIG__.chatbotUrl = fromEnv || fromLS;
  }
}
