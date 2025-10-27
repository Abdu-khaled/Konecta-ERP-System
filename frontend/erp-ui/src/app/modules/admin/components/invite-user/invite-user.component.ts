import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, InviteUserRequest } from '../../../admin/services/admin.service';

@Component({
  selector: 'app-admin-invite-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="flex items-start justify-center min-h-[calc(100vh-64px)] pt-4">
    <div class="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-10 border border-gray-200">
      <p class="text-gray-500 text-sm mb-1">Send invitations to HR, Finance, or Employees.</p>
      <h1 class="text-2xl font-semibold mb-6">Invite User</h1>
      <form (ngSubmit)="submit()" class="flex flex-col gap-5">
        <div>
          <label class="block text-base text-gray-600 mb-2">Full name</label>
          <input [(ngModel)]="name" name="name" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"/>
        </div>
        <div>
          <label class="block text-base text-gray-600 mb-2">Email</label>
          <input [(ngModel)]="email" name="email" type="email" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"/>
        </div>
        <div>
          <label class="block text-base text-gray-600 mb-2">Role</label>
          <select [(ngModel)]="role" name="role" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm">
            <option value="EMPLOYEE">Employee</option>
            <option value="HR">HR</option>
            <option value="FINANCE">Finance</option>
          </select>
        </div>
        <button class="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-3 text-base font-medium shadow-md" [disabled]="loading()">Send Invite</button>
        <p *ngIf="message()" class="text-green-700 text-sm">{{message()}}</p>
        <p *ngIf="error()" class="text-red-600 text-sm">{{error()}}</p>
      </form>
    </div>
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
