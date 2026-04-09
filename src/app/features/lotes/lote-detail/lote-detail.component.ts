import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoteApiService, LoteApi } from '../../../core/services/lote-api.service';

interface LoteDetailView {
  id: string;
  numero: string;
  dataProd: Date;
  turno: 'manha' | 'tarde' | 'noite';
  linha: string;
  qtdProduzida: number;
  qtdReprovada: number;
  status: string;
  observacoes?: string | null;
  createdAt?: Date | null;
  encerradoEm?: Date | null;
  produto?: {
    id: string;
    nome: string;
    codigo: string;
    unidade: string;
  };
  operador?: {
    id: string;
    nome: string;
    email: string;
  };
  insumos: Array<{
    id: string;
    nome: string;
    codigo?: string | null;
    loteInsumo?: string | null;
    quantidade: number;
    unidade: string;
  }>;
  inspecao?: {
    id: string;
    resultado: string;
    qtdReprovada: number;
    desvio?: string | null;
    dataInspecao: Date;
    inspetor?: {
      id: string;
      nome: string;
      email: string;
    } | null;
  } | null;
}

const STATUS_LABELS_LOCAL: Record<string, string> = {
  em_producao: 'Em produção',
  aguardando_inspecao: 'Aguardando inspeção',
  aprovado: 'Aprovado',
  aprovado_restricao: 'Aprovado c/ restrição',
  aprovado_com_restricao: 'Aprovado c/ restrição',
  reprovado: 'Reprovado',
};

const STATUS_CSS_LOCAL: Record<string, string> = {
  em_producao: 'badge-em-producao',
  aguardando_inspecao: 'badge-aguardando-inspecao',
  aprovado: 'badge-aprovado',
  aprovado_restricao: 'badge-aprovado-com-restricao',
  aprovado_com_restricao: 'badge-aprovado-com-restricao',
  reprovado: 'badge-reprovado',
};

const TURNO_LABELS_LOCAL: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

@Component({
  selector: 'app-lote-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lote-detail.component.html',
})
export class LoteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loteApi = inject(LoteApiService);

  loading = signal(true);
  encerrarLoading = signal(false);
  error = signal<string | null>(null);
  lote = signal<LoteDetailView | null>(null);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('ID do lote não informado.');
      this.loading.set(false);
      return;
    }

    await this.loadLote(id);
  }

  async loadLote(id: string) {
    try {
      this.loading.set(true);
      this.error.set(null);

      const response = await this.loteApi.getById(id);
      this.lote.set(this.mapLote(response));
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível carregar o lote.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  async encerrarLote() {
    const current = this.lote();

    if (!current) return;
    if (current.status !== 'em_producao') return;

    try {
      this.encerrarLoading.set(true);
      const updated = await this.loteApi.updateStatus(
        current.id,
        'aguardando_inspecao'
      );

      this.lote.set(this.mapLote(updated));
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível encerrar o lote.'
      );
    } finally {
      this.encerrarLoading.set(false);
    }
  }

  private mapLote(lote: LoteApi): LoteDetailView {
    return {
      id: String(lote.id),
      numero: lote.numeroLote,
      dataProd: new Date(lote.dataProducao),
      turno: lote.turno,
      linha: lote.linha,
      qtdProduzida: lote.quantidadeProd,
      qtdReprovada: lote.quantidadeRepr,
      status: lote.status,
      observacoes: lote.observacoes ?? null,
      createdAt: lote.abertoEm ? new Date(lote.abertoEm) : null,
      encerradoEm: lote.encerradoEm ? new Date(lote.encerradoEm) : null,
      produto: lote.produto
        ? {
            id: String(lote.produto.id),
            nome: lote.produto.nome,
            codigo: lote.produto.codigo,
            unidade: 'unid.',
          }
        : undefined,
      operador: lote.operador
        ? {
            id: String(lote.operador.id),
            nome: lote.operador.nome,
            email: lote.operador.email,
          }
        : undefined,
      insumos: (lote.insumos ?? []).map((ins) => ({
        id: String(ins.id),
        nome: ins.nomeInsumo,
        codigo: ins.codigoInsumo ?? null,
        loteInsumo: ins.loteInsumo ?? null,
        quantidade: ins.quantidade,
        unidade: ins.unidade,
      })),
      inspecao: lote.inspecao
        ? {
            id: String(lote.inspecao.id),
            resultado: lote.inspecao.resultado,
            qtdReprovada: lote.inspecao.quantidadeRepr,
            desvio: lote.inspecao.descricaoDesvio ?? null,
            dataInspecao: new Date(lote.inspecao.inspecionadoEm),
            inspetor: lote.inspecao.inspetor
              ? {
                  id: String(lote.inspecao.inspetor.id),
                  nome: lote.inspecao.inspetor.nome,
                  email: lote.inspecao.inspetor.email,
                }
              : null,
          }
        : null,
    };
  }

  getStatusLabel(status: string) {
    return STATUS_LABELS_LOCAL[status] ?? status;
  }

  getStatusCss(status: string) {
    return STATUS_CSS_LOCAL[status] ?? 'badge';
  }

  turnoLabel(turno: string) {
    return TURNO_LABELS_LOCAL[turno] ?? turno;
  }
}