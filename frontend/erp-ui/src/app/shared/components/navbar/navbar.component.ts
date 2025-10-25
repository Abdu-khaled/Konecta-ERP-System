import { Component, EventEmitter, HostListener, Input, Output, OnDestroy } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { NavThemeService } from '../../nav-theme.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, NgClass],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnDestroy {
  @Input() user: { initials: string; email: string } | null = null;
  @Input() role: string | null = null;
  @Output() toggle = new EventEmitter<void>();
  @Output() signOut = new EventEmitter<void>();
  isProfileMenuOpen = false;
  readonly launcherDots = Array.from({ length: 9 });
  isBrand = false;
  private sub = this.theme.isBrand$.subscribe(v => this.isBrand = !!v);
  isHomeRoute = false;
  isAuthRoute = false;
  private routeSub: Subscription;

  constructor(private theme: NavThemeService, private router: Router) {
    const computeIsHome = () => {
      const full = this.router.url || '/';
      const pathOnly = full.split('?')[0].split('#')[0];
      this.isHomeRoute = pathOnly === '/' || pathOnly === '';
      this.isAuthRoute = pathOnly.startsWith('/auth');
    };
    computeIsHome();
    this.routeSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => computeIsHome());
  }

  get initials(): string {
    return this.user?.initials ?? '';
  }

  get email(): string {
    return this.user?.email ?? '';
  }

  toggleProfileMenu(): void { this.isProfileMenuOpen = !this.isProfileMenuOpen; }
  onSignOutClick(): void { this.signOut.emit(); this.isProfileMenuOpen = false; }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    const t = event.target as HTMLElement | null;
    if (!t?.closest('.top-nav__profile-wrapper')) this.isProfileMenuOpen = false;
  }

  get brandOn(): boolean { return this.isBrand || !!this.role || this.isAuthRoute; }

  ngOnDestroy(): void { this.sub.unsubscribe(); this.routeSub.unsubscribe(); }
}

