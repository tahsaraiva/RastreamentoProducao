import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  RastreabilidadeApiService,
  RastreabilidadePorInsumoApiResponse,
  RastreabilidadePorLoteApiResponse,
} from '../../core/services/rastreabilidade-api.service';

type TipoBusca = 'lote' | 'insumo';

interface ResultadoLoteView {
  numero: string;
  dataProd: Date;
  turno: string;
  linha: string;
  quantidadeProd: number;
  quantidadeRepr: number;
  status: string;
  observacoes?: string | null;
  produto: {
    nome: string;
    codigo: string;
  };
  operador: {
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
    resultado: string;
    quantidadeRepr: number;
    descricaoDesvio?: string | null;
    inspecionadoEm: Date;
    inspetor?: {
      nome: string;
      email: string;
    } | null;
  } | null;
}

interface ResultadoInsumoView {
  termoBuscado: string;
  totalLotesAfetados: number;
  lotesAfetados: Array<{
    id: string;
    numero: string;
    dataProd: Date;
    status: string;
    linha: string;
    quantidadeProd: number;
    produto: {
      nome: string;
      codigo: string;
    };
    operador: {
      nome: string;
    };
    insumosCorrespondentes: Array<{
      id: string;
      nome: string;
      codigo?: string | null;
      loteInsumo?: string | null;
      quantidade: number;
      unidade: string;
    }>;
  }>;
}

const STATUS_LABELS_LOCAL: Record<string, string> = {
  em_producao: 'Em produção',
  aguardando_inspecao: 'Aguardando inspeção',
  aprovado: 'Aprovado',
  aprovado_restricao: 'Aprovado c/ restrição',
  aprovado_com_restricao: 'Aprovado c/ restrição',
  reprovado: 'Reprovado',
};

const TURNO_LABELS_LOCAL: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

@Component({
  selector: 'app-rastreabilidade',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rastreabilidade.component.html',
})
export class RastreabilidadeComponent implements OnInit {
  private rastreabilidadeApi = inject(RastreabilidadeApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tipoBusca = signal<TipoBusca>('lote');
  termo = signal('');

  loading = signal(false);
  error = signal<string | null>(null);

  resultadoLote = signal<ResultadoLoteView | null>(null);
  resultadoInsumo = signal<ResultadoInsumoView | null>(null);

  async ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('q');
    const tipo = this.route.snapshot.queryParamMap.get('tipo') as TipoBusca | null;

    if (tipo === 'lote' || tipo === 'insumo') {
      this.tipoBusca.set(tipo);
    } else if (q) {
      this.tipoBusca.set(q.toUpperCase().startsWith('LOT-') ? 'lote' : 'insumo');
    }

    if (q) {
      this.termo.set(q);
      await this.buscar();
    }
  }

  async buscar() {
    const termo = this.termo().trim();

    if (!termo) {
      this.error.set('Informe um número de lote ou um termo de insumo.');
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);
      this.resultadoLote.set(null);
      this.resultadoInsumo.set(null);

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          q: termo,
          tipo: this.tipoBusca(),
        },
        queryParamsHandling: 'merge',
      });

      if (this.tipoBusca() === 'lote') {
        const response = await this.rastreabilidadeApi.buscarPorLote(termo);
        this.resultadoLote.set(this.mapResultadoLote(response));
      } else {
        const response = await this.rastreabilidadeApi.buscarPorInsumo(termo);
        this.resultadoInsumo.set(this.mapResultadoInsumo(response));
      }
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível consultar a rastreabilidade.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  limpar() {
    this.termo.set('');
    this.error.set(null);
    this.resultadoLote.set(null);
    this.resultadoInsumo.set(null);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  private mapResultadoLote(response: RastreabilidadePorLoteApiResponse): ResultadoLoteView {
    return {
      numero: response.lote.numeroLote,
      dataProd: new Date(response.lote.dataProducao),
      turno: response.lote.turno,
      linha: response.lote.linha,
      quantidadeProd: response.lote.quantidadeProd,
      quantidadeRepr: response.lote.quantidadeRepr,
      status: response.lote.status,
      observacoes: response.lote.observacoes ?? null,
      produto: {
        nome: response.lote.produto.nome,
        codigo: response.lote.produto.codigo,
      },
      operador: {
        nome: response.lote.operador.nome,
        email: response.lote.operador.email,
      },
      insumos: response.lote.insumos.map((ins) => ({
        id: String(ins.id),
        nome: ins.nomeInsumo,
        codigo: ins.codigoInsumo ?? null,
        loteInsumo: ins.loteInsumo ?? null,
        quantidade: ins.quantidade,
        unidade: ins.unidade,
      })),
      inspecao: response.lote.inspecao
        ? {
            resultado: response.lote.inspecao.resultado,
            quantidadeRepr: response.lote.inspecao.quantidadeRepr,
            descricaoDesvio: response.lote.inspecao.descricaoDesvio ?? null,
            inspecionadoEm: new Date(response.lote.inspecao.inspecionadoEm),
            inspetor: response.lote.inspecao.inspetor
              ? {
                  nome: response.lote.inspecao.inspetor.nome,
                  email: response.lote.inspecao.inspetor.email,
                }
              : null,
          }
        : null,
    };
  }

  private mapResultadoInsumo(
    response: RastreabilidadePorInsumoApiResponse
  ): ResultadoInsumoView {
    return {
      termoBuscado: response.termoBuscado,
      totalLotesAfetados: response.totalLotesAfetados,
      lotesAfetados: response.lotesAfetados.map((lote) => ({
        id: String(lote.id),
        numero: lote.numeroLote,
        dataProd: new Date(lote.dataProducao),
        status: lote.status,
        linha: lote.linha,
        quantidadeProd: lote.quantidadeProd,
        produto: {
          nome: lote.produto.nome,
          codigo: lote.produto.codigo,
        },
        operador: {
          nome: lote.operador.nome,
        },
        insumosCorrespondentes: lote.insumosCorrespondentes.map((ins) => ({
          id: String(ins.id),
          nome: ins.nomeInsumo,
          codigo: ins.codigoInsumo ?? null,
          loteInsumo: ins.loteInsumo ?? null,
          quantidade: ins.quantidade,
          unidade: ins.unidade,
        })),
      })),
    };
  }

  getStatusLabel(s: string): string {
  const map: Record<string, string> = {
    em_producao: 'Em produção',
    aguardando_inspecao: 'Aguardando inspeção',
    aprovado: 'Aprovado',
    aprovado_com_restricao: 'Aprovado c/ restrição',
    aprovado_restricao: 'Aprovado c/ restrição',
    reprovado: 'Reprovado',
  };
  return map[s] ?? s;
}

getStatusCss(s: string): string {
  const map: Record<string, string> = {
    em_producao: 'badge-em-producao',
    aguardando_inspecao: 'badge-aguardando-inspecao',
    aprovado: 'badge-aprovado',
    aprovado_com_restricao: 'badge-aprovado-com-restricao',
    aprovado_restricao: 'badge-aprovado-com-restricao',
    reprovado: 'badge-reprovado',
  };
  return map[s] ?? 'badge';
}

resultadoCss(r: string): string {
  const map: Record<string, string> = {
    aprovado: 'badge-aprovado',
    aprovado_com_restricao: 'badge-aprovado-com-restricao',
    aprovado_restricao: 'badge-aprovado-com-restricao',
    reprovado: 'badge-reprovado',
  };
  return map[r] ?? 'badge';
}
  turnoLabel(turno: string) {
    return TURNO_LABELS_LOCAL[turno] ?? turno;
  }
}
