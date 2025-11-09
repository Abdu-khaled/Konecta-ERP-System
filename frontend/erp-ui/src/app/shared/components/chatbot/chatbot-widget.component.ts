import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

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

  toggle() { this.open = !this.open; }
  close() { this.open = false; }

  send(ev: Event) {
    ev.preventDefault();
    const t = (this.text || '').trim();
    if (!t) return;
    this.messages.push({ from: 'user', text: t, ts: Date.now() });
    this.text = '';

    setTimeout(() => {
      this.messages.push({
        from: 'bot',
        text: 'Thanks! The AI integration will be wired here.',
        ts: Date.now()
      });
    }, 400);
  }
}

