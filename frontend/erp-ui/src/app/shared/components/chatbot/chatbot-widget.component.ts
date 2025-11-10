import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { HttpClient } from '@angular/common/http';

type MsgFrom = 'user' | 'bot';
interface ChatMsg { from: MsgFrom; text: string; ts: number; }

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './chatbot-widget.component.html'
})
export class ChatbotWidgetComponent {
  open = false;
  text = '';
  messages: ChatMsg[] = [
    { from: 'bot', text: 'Hi! I\'m your Sync Assistant. How can I help?', ts: Date.now() }
  ];

  private readonly http = inject(HttpClient);
  private readonly sessionKey = 'sync_chat_session_id';
  private readonly sessionID = this.ensureSessionId();

  private get chatUrl(): string {
    const w: any = (globalThis as any) || {};
    const fromConfig = w.__APP_CONFIG__?.chatbotUrl as string | undefined;
    const fromEnv = (w.__ENV__?.CHATBOT_URL || w.ENV?.CHATBOT_URL) as string | undefined;
    let fromLS = '';
    try { fromLS = localStorage.getItem('CHATBOT_URL') || ''; } catch {}
    let fromMeta = '';
    try { const m = document.querySelector('meta[name="chatbot-url"]') as HTMLMetaElement | null; fromMeta = m?.content || ''; } catch {}
    return String(fromConfig || fromEnv || fromLS || fromMeta || '');
  }

  private ensureSessionId(): string {
    try {
      const existing = localStorage.getItem(this.sessionKey);
      if (existing) return existing;
      const id = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
        ? (globalThis.crypto as any).randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(this.sessionKey, id);
      return id;
    } catch {
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }

  toggle() { this.open = !this.open; }
  close() { this.open = false; }

  send(ev: Event) {
    ev.preventDefault();
    const t = (this.text || '').trim();
    if (!t) return;
    this.messages.push({ from: 'user', text: t, ts: Date.now() });
    this.text = '';

    const url = this.chatUrl;
    if (!url) {
      this.messages.push({ from: 'bot', text: 'Assistant is not configured. Set one of: window.__APP_CONFIG__.chatbotUrl, window.__ENV__.CHATBOT_URL, localStorage.CHATBOT_URL, or <meta name="chatbot-url" content="...">.', ts: Date.now() });
      return;
    }

    const pendingIndex = this.messages.push({ from: 'bot', text: '…', ts: Date.now() }) - 1;
    this.http.post(url, { text: t, sessionID: this.sessionID }, { responseType: 'text' }).subscribe({
      next: (res) => {
        let reply = (res || '').toString();
        try { const j = JSON.parse(res as any); reply = j.reply || j.text || j.message || res as any; } catch {}
        this.messages[pendingIndex] = { from: 'bot', text: String(reply || '✓'), ts: Date.now() };
      },
      error: (err) => {
        const msg = err?.error || err?.message || 'Sorry, I could not reach the assistant.';
        this.messages[pendingIndex] = { from: 'bot', text: String(msg), ts: Date.now() };
      }
    });
  }
}
