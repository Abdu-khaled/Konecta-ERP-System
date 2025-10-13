import { Component, HostListener } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './features/navbar/navbar.component';
import { SidebarComponent } from './features/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgClass,
    NavbarComponent,
    SidebarComponent
  ],
  template: `
<div class="min-h-screen flex flex-col bg-slate-100 text-slate-900">
  <app-navbar [user]="user" (toggle)="toggleSidebar()" (signOut)="onSignOut()"></app-navbar>
  <div class="flex flex-1 overflow-hidden">
    <app-sidebar [isOpen]="isSidebarOpen" [items]="sidebarItems"></app-sidebar>
    <main class="flex-1 overflow-y-auto bg-white p-8">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
  `
})
export class AppComponent {
  readonly sidebarItems = [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Favorites', icon: 'star' },
    { label: 'Recent', icon: 'clock' },
    { label: 'Workspaces', icon: 'boards' },
    { label: 'Modules', icon: 'grid' }
  ];

  isSidebarOpen = false;
  isProfileMenuOpen = false;

  user: { initials: string; email: string } | null = {
    initials: 'BI',
    email: 'bi@example.com'
  };

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.top-nav__profile-wrapper')) {
      this.closeProfileMenu();
    }
  }

  constructor(private router: Router) {}

  onSignOut(): void {
    this.user = null;
    this.router.navigate(['/auth/login']);
  }
}











