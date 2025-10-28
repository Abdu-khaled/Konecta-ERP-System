import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { LoadingBarComponent } from '../../../shared/components/loading-bar/loading-bar.component';
import { AuthState } from '../../services/auth-state.service';
import { Subscription } from 'rxjs';
import { buildSidebarForRole, SidebarItem } from './main-layout.hook';

@Component({
  selector: 'app-main-layout',
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
    SidebarComponent,
    ToastComponent,
    LoadingBarComponent
  ],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarItems: SidebarItem[] = [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Favorites', icon: 'star' },
    { label: 'Recent', icon: 'schedule' },
    { label: 'Workspaces', icon: 'dashboard' },
    { label: 'Modules', icon: 'apps' }
  ];

  isSidebarOpen = false;
  isProfileMenuOpen = false;

  user: { initials: string; email: string } | null = null;
  role: string | null = null;
  private sub?: Subscription;
  isHomeGuest = false;

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
        this.sidebarItems = buildSidebarForRole(this.role);
      } else {
        this.user = null;
        this.role = null;
        this.sidebarItems = buildSidebarForRole(null);
      }
      this.computeHomeGuest();
    });
    this.router.events.subscribe(() => this.computeHomeGuest());
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

  private computeHomeGuest() {
    const full = this.router.url || '/';
    const pathOnly = full.split('?')[0].split('#')[0];
    this.isHomeGuest = (!this.role) && (pathOnly === '/' || pathOnly === '');
  }
}

