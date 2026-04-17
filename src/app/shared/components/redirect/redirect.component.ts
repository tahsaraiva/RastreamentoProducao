import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: `<div class="p-8 text-text-muted">Redirecionando...</div>`,
})
export class RedirectComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    const perfil = this.auth.perfil();
    switch (perfil) {
      case 'gestor':
        this.router.navigate(['/app/dashboard']);
        break;
      case 'operador':
        this.router.navigate(['/app/lotes']);
        break;
      case 'inspetor':
        this.router.navigate(['/app/lotes']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
