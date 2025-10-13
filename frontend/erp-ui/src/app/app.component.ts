import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './features/navbar/navbar.component';
import { SidebarComponent } from './features/sidebar/sidebar.component';
import { AuthState } from './features/auth/services/auth.state';
import { Subscription } from 'rxjs';

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
  <app-navbar [user]="user" [role]="role" (toggle)="toggleSidebar()" (signOut)="onSignOut()"></app-navbar>
  <div class="isolate flex flex-1 overflow-hidden">
    <app-sidebar [isOpen]="isSidebarOpen" [role]="role" [items]="sidebarItems"></app-sidebar>
    <main class="relative z-0 pointer-events-auto flex-1 overflow-y-auto bg-white p-8">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  sidebarItems: Array<{ label: string; icon: string; path?: string }> = [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Favorites', icon: 'star' },
    { label: 'Recent', icon: 'clock' },
    { label: 'Workspaces', icon: 'boards' },
    { label: 'Modules', icon: 'boards' }
  ];

  isSidebarOpen = false;
  isProfileMenuOpen = false;

  user: { initials: string; email: string } | null = null;
  role: string | null = null;
  private sub?: Subscription;

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

  private readonly state = inject(AuthState);
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.sub = this.state.profile$.subscribe((p) => {
      if (p) {
        this.user = {
          initials: (p.username?.[0] || 'U').toUpperCase(),
          email: p.email
        };
        this.role = p.role || null;
        this.sidebarItems = this.buildSidebarForRole(this.role);
      } else {
        this.user = null;
        this.role = null;
        this.sidebarItems = this.buildSidebarForRole(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSignOut(): void {
    this.state.clear();
    this.user = null;
    this.role = null;
    this.router.navigate(['/auth/login']);
  }

  private buildSidebarForRole(role: string | null): Array<{ label: string; icon: string; path?: string }> {
    if (role === 'EMPLOYEE') {
      return [
        { label: 'Dashboard', icon: 'home' },
        { label: ' Attendance', icon: 'clock' },
        { label: ' Leave Requests', icon: 'star' },
        { label: ' Performance', icon: 'star' },
        { label: ' Payroll', icon: 'boards' },
        { label: 'Training & Learning', icon: 'boards' },
        { label: 'Help / Support', icon: 'boards' }
      ];
    }
    // default/basic sidebar when not signed in or other roles (can customize later)
    return [
      { label: 'Home', icon: 'home', path: '/' },
      { label: 'Favorites', icon: 'star' },
      { label: 'Recent', icon: 'clock' },
      { label: 'Workspaces', icon: 'boards' },
      { label: 'Modules', icon: 'boards' }
    ];
  }
}











