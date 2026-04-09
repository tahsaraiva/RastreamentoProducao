import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoteApiService } from '../../core/services/lote-api.service';
import {
  CreateInspecaoApiPayload,
  InspecaoApiService,
} from '../../core/services/inspecao-api.service';

interface LoteInspecaoView {
  id: string;
  numero: string;
  produtoNome: string;
  status: string;
  dataProd: Date;
  linha: string;
  qtdProduzida: number;
}

@Component({
  selector: 'app-inspecao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inspecao.component.html',
})
export class InspecaoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loteApi = inject(LoteApiService);
  private inspecaoApi = inject(InspecaoApiService);

  loteId = '';
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  lote = signal<LoteInspecaoView | null>(null);

  form = {
    resultado: 'aprovado' as 'aprovado' | 'aprovado_restricao' | 'reprovado',
    quantidadeRepr: 0,
    descricaoDesvio: '',
  };

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('ID do lote não informado.');
      this.loading.set(false);
      return;
    }

    this.loteId = id;
    await this.loadLote();
  }

  async loadLote() {
    try {
      this.loading.set(true);
      this.error.set(null);

      const response = await this.loteApi.getById(this.loteId);

      this.lote.set({
        id: String(response.id),
        numero: response.numeroLote,
        produtoNome: response.produto?.nome ?? '—',
        status: response.status,
        dataProd: new Date(response.dataProducao),
        linha: response.linha,
        qtdProduzida: response.quantidadeProd,
      });
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível carregar os dados do lote.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  get canInspect() {
    return this.lote()?.status === 'aguardando_inspecao';
  }

  get precisaDesvio() {
    return this.form.resultado !== 'aprovado';
  }

  async salvarInspecao() {
    if (!this.canInspect) {
      this.error.set('Somente lotes aguardando inspeção podem ser inspecionados.');
      return;
    }

    if (this.precisaDesvio && !this.form.descricaoDesvio.trim()) {
      this.error.set('A descrição do desvio é obrigatória para resultados não aprovados.');
      return;
    }

    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const payload: CreateInspecaoApiPayload = {
        resultado: this.form.resultado,
        quantidadeRepr: Number(this.form.quantidadeRepr || 0),
        descricaoDesvio: this.precisaDesvio
          ? this.form.descricaoDesvio.trim()
          : null,
      };

      await this.inspecaoApi.create(this.loteId, payload);

      this.success.set('Inspeção registrada com sucesso.');

      setTimeout(() => {
        this.router.navigate(['/app/lotes', this.loteId]);
      }, 800);
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível registrar a inspeção.'
      );
    } finally {
      this.saving.set(false);
    }
  }
}