import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: `
    <div class="flex items-center justify-center h-64">
      <div class="text-text-muted text-sm">Redirecionando...</div>
    </div>
  `,
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
