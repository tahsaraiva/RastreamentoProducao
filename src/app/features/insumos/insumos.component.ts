import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoteApiService } from '../../core/services/lote-api.service';
import {
  CreateInsumoApiPayload,
  InsumoApiService,
} from '../../core/services/insumo-api.service';

interface LoteHeaderView {
  id: string;
  numero: string;
  produtoNome: string;
  status: string;
  linha: string;
}

interface InsumoView {
  id: string;
  nome: string;
  codigo?: string | null;
  loteInsumo?: string | null;
  quantidade: number;
  unidade: string;
}

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './insumos.component.html',
})
export class InsumosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private loteApi = inject(LoteApiService);
  private insumoApi = inject(InsumoApiService);

  loteId = '';
  loading = signal(true);
  saving = signal(false);
  removingId = signal<string | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  lote = signal<LoteHeaderView | null>(null);
  insumos = signal<InsumoView[]>([]);

  form = {
    nomeInsumo: '',
    codigoInsumo: '',
    loteInsumo: '',
    quantidade: null as number | null,
    unidade: '',
  };

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('ID do lote não informado.');
      this.loading.set(false);
      return;
    }

    this.loteId = id;
    await this.loadData();
  }

  async loadData() {
    try {
      this.loading.set(true);
      this.error.set(null);
      this.success.set(null);

      const [loteResponse, insumosResponse] = await Promise.all([
        this.loteApi.getById(this.loteId),
        this.insumoApi.listByLote(this.loteId),
      ]);

      this.lote.set({
        id: String(loteResponse.id),
        numero: loteResponse.numeroLote,
        produtoNome: loteResponse.produto?.nome ?? '—',
        status: loteResponse.status,
        linha: loteResponse.linha,
      });

      this.insumos.set(
        insumosResponse.map((ins) => ({
          id: String(ins.id),
          nome: ins.nomeInsumo,
          codigo: ins.codigoInsumo ?? null,
          loteInsumo: ins.loteInsumo ?? null,
          quantidade: ins.quantidade,
          unidade: ins.unidade,
        }))
      );
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível carregar os insumos do lote.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  get canEdit() {
    return this.lote()?.status === 'em_producao';
  }

  async adicionarInsumo() {
    if (!this.canEdit) {
      this.error.set('Só é possível editar insumos de lotes em produção.');
      return;
    }

    if (!this.form.nomeInsumo || !this.form.quantidade || !this.form.unidade) {
      this.error.set('Nome do insumo, quantidade e unidade são obrigatórios.');
      return;
    }

    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const payload: CreateInsumoApiPayload = {
        nomeInsumo: this.form.nomeInsumo.trim(),
        codigoInsumo: this.form.codigoInsumo.trim() || null,
        loteInsumo: this.form.loteInsumo.trim() || null,
        quantidade: Number(this.form.quantidade),
        unidade: this.form.unidade.trim(),
      };

      await this.insumoApi.create(this.loteId, payload);

      this.form = {
        nomeInsumo: '',
        codigoInsumo: '',
        loteInsumo: '',
        quantidade: null,
        unidade: '',
      };

      this.success.set('Insumo adicionado com sucesso.');
      await this.loadData();
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível adicionar o insumo.'
      );
    } finally {
      this.saving.set(false);
    }
  }

  async removerInsumo(insumoId: string) {
    if (!this.canEdit) {
      this.error.set('Só é possível remover insumos de lotes em produção.');
      return;
    }

    try {
      this.removingId.set(insumoId);
      this.error.set(null);
      this.success.set(null);

      await this.insumoApi.remove(this.loteId, insumoId);

      this.success.set('Insumo removido com sucesso.');
      await this.loadData();
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível remover o insumo.'
      );
    } finally {
      this.removingId.set(null);
    }
  }
}