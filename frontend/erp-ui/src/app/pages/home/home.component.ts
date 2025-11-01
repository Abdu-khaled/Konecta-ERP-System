import { Component, inject, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthState } from '../../core/services/auth-state.service';
import { NavThemeService } from '../../shared/nav-theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements AfterViewInit, OnDestroy, OnInit {
  private readonly state = inject(AuthState);
  private readonly navTheme = inject(NavThemeService);
  private readonly router = inject(Router);
  private heroObserver?: IntersectionObserver;

  get role(): string | null { return this.state.profile?.role ?? null; }

  ngOnInit(): void {
    // When logged in, send users to their specific dashboards
    const r = this.role;
    if (r === 'ADMIN') this.router.navigate(['/admin/dashboard']);
    else if (r === 'HR') this.router.navigate(['/hr/dashboard']);
    else if (r === 'FINANCE') this.router.navigate(['/finance/dashboard']);
    else if (r === 'EMPLOYEE') this.router.navigate(['/employee/dashboard']);
  }

  ngAfterViewInit(): void {
    if (!this.role) {
      const hero = document.getElementById('hero');
      if (hero) {
        this.heroObserver = new IntersectionObserver((entries) => {
          const e = entries[0];
          this.navTheme.setBrand(e.isIntersecting && e.intersectionRatio > 0.1);
        }, { threshold: [0, 0.1, 0.3, 0.6, 1] });
        this.heroObserver.observe(hero);
        const rect = hero.getBoundingClientRect();
        const inView = rect.top <= (window.innerHeight || 0) && rect.bottom >= 0;
        this.navTheme.setBrand(inView);
      } else {
        this.navTheme.setBrand(false);
      }
    }
  }

  ngOnDestroy(): void {
    this.heroObserver?.disconnect();
    this.navTheme.setBrand(false);
  }
}
