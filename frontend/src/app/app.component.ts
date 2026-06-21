import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main id="main-content" tabindex="-1">
      <router-outlet></router-outlet>
    </main>
    @if (mostrarFooter()) {
      <app-footer></app-footer>
    }
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--bg);
    }
  `]
})
export class AppComponent {
  title = 'BarberPro';

  private url = signal('');

  // El footer no aparece en los paneles a pantalla completa (/admin, /user)
  mostrarFooter = computed(() => {
    const u = this.url();
    return !u.startsWith('/admin') && !u.startsWith('/user');
  });

  constructor(router: Router) {
    this.url.set(router.url);
    router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.url.set((e as NavigationEnd).urlAfterRedirects));
  }
}
