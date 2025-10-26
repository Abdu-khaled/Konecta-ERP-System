import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, InviteUserRequest } from '../../../admin/services/admin.service';

@Component({
  selector: 'app-admin-invite-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="mx-auto max-w-xl py-8">
    <h1 class="text-2xl font-semibold mb-4">Invite User</h1>
    <form (ngSubmit)="submit()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium">Full name</label>
        <input [(ngModel)]="name" name="name" required class="w-full border rounded px-3 py-2"/>
      </div>
      <div>
        <label class="block text-sm font-medium">Email</label>
        <input [(ngModel)]="email" name="email" type="email" required class="w-full border rounded px-3 py-2"/>
      </div>
      <div>
        <label class="block text-sm font-medium">Role</label>
        <select [(ngModel)]="role" name="role" required class="w-full border rounded px-3 py-2">
          <option value="EMPLOYEE">Employee</option>
          <option value="HR">HR</option>
          <option value="FINANCE">Finance</option>
        </select>
      </div>
      <button class="w-full bg-primary-600 text-white rounded px-3 py-2" [disabled]="loading()">Send Invite</button>
      <p *ngIf="message()" class="text-green-700 text-sm">{{message()}}</p>
      <p *ngIf="error()" class="text-red-600 text-sm">{{error()}}</p>
    </form>
  </div>
  `
})
export class InviteUserComponent {
  private readonly admin = inject(AdminService);

  name = '';
  email = '';
  role: 'EMPLOYEE' | 'HR' | 'FINANCE' = 'EMPLOYEE';

  loading = signal(false);
  message = signal('');
  error = signal('');

  submit() {
    this.loading.set(true);
    this.message.set(''); this.error.set('');
    const payload: InviteUserRequest = { name: this.name, email: this.email, role: this.role };
    this.admin.inviteUser(payload).subscribe({
      next: () => {
        this.message.set('Invitation sent. User will complete registration from email link.');
        this.loading.set(false);
        this.name=''; this.email=''; this.role='EMPLOYEE';
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'Failed to send invite');
        this.loading.set(false);
      }
    })
  }
}

