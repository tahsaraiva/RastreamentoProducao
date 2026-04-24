import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioApi, UsuarioApiService, CreateUsuarioDTO } from '../../core/services/usuario-api.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  private usuarioApi = inject(UsuarioApiService);

  loading  = signal(true);
  saving   = signal(false);
  error    = signal<string | null>(null);
  success  = signal<string | null>(null);

  usuarios   = signal<UsuarioApi[]>([]);
  editandoId = signal<number | null>(null);

  form = {
    nome:   '',
    email:  '',
    senha:  '',
    perfil: '' as 'operador' | 'inspetor' | 'gestor' | '',
  };

  perfis: { value: 'operador' | 'inspetor' | 'gestor'; label: string }[] = [
    { value: 'gestor',   label: 'Gestor de Qualidade' },
    { value: 'inspetor', label: 'Inspetor de Qualidade' },
    { value: 'operador', label: 'Operador de Linha' },
  ];

  async ngOnInit() {
    await this.carregar();
  }

  async carregar() {
    try {
      this.loading.set(true);
      this.error.set(null);
      this.usuarios.set(await this.usuarioApi.list());
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'Não foi possível carregar os usuários.');
    } finally {
      this.loading.set(false);
    }
  }

  novoUsuario() {
    this.editandoId.set(null);
    this.form = { nome: '', email: '', senha: '', perfil: '' };
    this.error.set(null);
    this.success.set(null);
  }

  editarUsuario(u: UsuarioApi) {
    this.editandoId.set(u.id);
    this.form = { nome: u.nome, email: u.email, senha: '', perfil: u.perfil };
    this.error.set(null);
    this.success.set(null);
  }

  async salvar() {
    if (!this.form.nome || !this.form.email || !this.form.perfil) {
      this.error.set('Nome, e-mail e perfil são obrigatórios.');
      return;
    }
    if (!this.editandoId() && !this.form.senha) {
      this.error.set('Senha é obrigatória para novo usuário.');
      return;
    }

    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      if (this.editandoId()) {
        const payload: Partial<CreateUsuarioDTO> = {
          nome:   this.form.nome.trim(),
          email:  this.form.email.trim(),
          perfil: this.form.perfil as 'operador' | 'inspetor' | 'gestor',
        };
        if (this.form.senha) payload.senha = this.form.senha;
        await this.usuarioApi.update(this.editandoId()!, payload);
        this.success.set('Usuário atualizado com sucesso.');
      } else {
        await this.usuarioApi.create({
          nome:   this.form.nome.trim(),
          email:  this.form.email.trim(),
          senha:  this.form.senha,
          perfil: this.form.perfil as 'operador' | 'inspetor' | 'gestor',
        });
        this.success.set('Usuário criado com sucesso.');
      }

      this.novoUsuario();
      await this.carregar();
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'Não foi possível salvar o usuário.');
    } finally {
      this.saving.set(false);
    }
  }

  async remover(u: UsuarioApi) {
    if (!confirm(`Remover o usuário "${u.nome}"?`)) return;
    try {
      this.error.set(null);
      await this.usuarioApi.remove(u.id);
      this.success.set('Usuário removido com sucesso.');
      await this.carregar();
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'Não foi possível remover o usuário.');
    }
  }

  perfilLabel(p: string): string {
    const map: Record<string, string> = {
      gestor:   'Gestor',
      inspetor: 'Inspetor',
      operador: 'Operador',
    };
    return map[p] ?? p;
  }

  perfilCss(p: string): string {
    const map: Record<string, string> = {
      gestor:   'badge-aprovado',
      inspetor: 'badge-aguardando-inspecao',
      operador: 'badge-em-producao',
    };
    return map[p] ?? 'badge';
  }
}
