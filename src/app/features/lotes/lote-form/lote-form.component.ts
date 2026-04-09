import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProdutoApiService } from '../../../core/services/produto-api.service';
import {
  CreateLoteApiPayload,
  LoteApiService,
} from '../../../core/services/lote-api.service';
import { AuthService } from '../../../core/services/auth.service';

interface ProdutoOptionView {
  id: string;
  nome: string;
  codigo: string;
  linha: string;
}

const TURNO_OPTIONS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
] as const;

@Component({
  selector: 'app-lote-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lote-form.component.html',
})
export class LoteFormComponent implements OnInit {
  private produtoApi = inject(ProdutoApiService);
  private loteApi = inject(LoteApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  produtos = signal<ProdutoOptionView[]>([]);
  turnoOptions = TURNO_OPTIONS;

  form = {
    produtoId: '',
    dataProducao: new Date().toISOString().split('T')[0],
    turno: 'manha' as 'manha' | 'tarde' | 'noite',
    linha: '',
    quantidadeProd: null as number | null,
    observacoes: '',
  };

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);

      const produtos = await this.produtoApi.list();

      this.produtos.set(
        produtos
          .filter((p) => p.ativo)
          .map((p) => ({
            id: String(p.id),
            nome: p.nome,
            codigo: p.codigo,
            linha: p.linha,
          }))
      );
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível carregar os produtos.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  onProdutoChange(produtoId: string) {
    this.form.produtoId = produtoId;

    const produto = this.produtos().find((p) => p.id === produtoId);
    if (produto) {
      this.form.linha = produto.linha;
    }
  }

  async salvar() {
    const user = this.auth.user();

    if (!user) {
      this.error.set('Usuário não autenticado.');
      return;
    }

    if (
      !this.form.produtoId ||
      !this.form.dataProducao ||
      !this.form.turno ||
      !this.form.linha ||
      !this.form.quantidadeProd
    ) {
      this.error.set(
        'Produto, data de produção, turno, linha e quantidade são obrigatórios.'
      );
      return;
    }

    try {
      this.saving.set(true);
      this.error.set(null);

      const payload: CreateLoteApiPayload = {
        produtoId: Number(this.form.produtoId),
        dataProducao: this.form.dataProducao,
        turno: this.form.turno,
        operadorId: Number(user.id),
        linha: this.form.linha.trim(),
        quantidadeProd: Number(this.form.quantidadeProd),
        observacoes: this.form.observacoes.trim() || null,
      };

      const loteCriado = await this.loteApi.create(payload);

      this.router.navigate(['/app/lotes', loteCriado.id]);
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível abrir o lote.'
      );
    } finally {
      this.saving.set(false);
    }
  }
}