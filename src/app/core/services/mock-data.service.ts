import { Injectable } from '@angular/core';
import {
  Lote, Produto, InsumoLote, InspecaoLote, User,
  StatusLote, DashboardMetrics
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  readonly produtos: Produto[] = [
    { id: 'p1', codigo: 'PRD-001', nome: 'Comprimido Ibuprofeno 400mg', descricao: 'Analgésico e anti-inflamatório', unidade: 'comprimido', createdAt: new Date('2024-01-10') },
    { id: 'p2', codigo: 'PRD-002', nome: 'Cápsula Vitamina C 500mg', descricao: 'Suplemento vitamínico', unidade: 'cápsula', createdAt: new Date('2024-01-15') },
    { id: 'p3', codigo: 'PRD-003', nome: 'Xarope Expectorante 120ml', descricao: 'Medicamento expectorante', unidade: 'frasco', createdAt: new Date('2024-02-01') },
    { id: 'p4', codigo: 'PRD-004', nome: 'Pomada Diclofenaco 1%', descricao: 'Anti-inflamatório tópico', unidade: 'bisnaga', createdAt: new Date('2024-02-10') },
    { id: 'p5', codigo: 'PRD-005', nome: 'Solução Salina 0,9% 500ml', descricao: 'Solução fisiológica estéril', unidade: 'bolsa', createdAt: new Date('2024-03-01') },
  ];

  readonly insumos: InsumoLote[] = [
    { id: 'ins1', loteId: 'l1', nomeInsumo: 'Ibuprofeno PA', codigoInsumo: 'INS-IBU-01', loteInsumo: 'FRN-2024-1103', quantidade: 12, unidade: 'kg', fornecedor: 'Basf Química', createdAt: new Date('2024-04-15') },
    { id: 'ins2', loteId: 'l1', nomeInsumo: 'Celulose microcristalina', codigoInsumo: 'INS-CEL-02', loteInsumo: 'FRN-2024-0892', quantidade: 5.4, unidade: 'kg', fornecedor: 'FMC BioPolymer', createdAt: new Date('2024-04-15') },
    { id: 'ins3', loteId: 'l1', nomeInsumo: 'Estearato de magnésio', codigoInsumo: 'INS-EST-03', loteInsumo: 'FRN-2024-0445', quantidade: 0.6, unidade: 'kg', fornecedor: 'Peter Greven', createdAt: new Date('2024-04-15') },
    { id: 'ins4', loteId: 'l2', nomeInsumo: 'Vitamina C (Ácido Ascórbico)', codigoInsumo: 'INS-VTC-01', loteInsumo: 'FRN-2024-1210', quantidade: 25, unidade: 'kg', fornecedor: 'DSM Nutritional', createdAt: new Date('2024-04-16') },
    { id: 'ins5', loteId: 'l2', nomeInsumo: 'Gelatina grau farmacêutico', codigoInsumo: 'INS-GEL-04', loteInsumo: 'FRN-2024-0771', quantidade: 8, unidade: 'kg', fornecedor: 'Gelita Group', createdAt: new Date('2024-04-16') },
    { id: 'ins6', loteId: 'l3', nomeInsumo: 'Ibuprofeno PA', codigoInsumo: 'INS-IBU-01', loteInsumo: 'FRN-2024-1103', quantidade: 12, unidade: 'kg', fornecedor: 'Basf Química', createdAt: new Date('2024-05-02') },
    { id: 'ins7', loteId: 'l3', nomeInsumo: 'Dióxido de titânio', codigoInsumo: 'INS-DIO-05', loteInsumo: 'FRN-2024-0330', quantidade: 0.2, unidade: 'kg', fornecedor: 'Kronos Worldwide', createdAt: new Date('2024-05-02') },
    { id: 'ins8', loteId: 'l4', nomeInsumo: 'Diclofenaco Sódico PA', codigoInsumo: 'INS-DIC-06', loteInsumo: 'FRN-2024-0980', quantidade: 1.5, unidade: 'kg', fornecedor: 'Zhejiang NHU', createdAt: new Date('2024-05-10') },
    { id: 'ins9', loteId: 'l5', nomeInsumo: 'Cloreto de Sódio PA', codigoInsumo: 'INS-NaCl-07', loteInsumo: 'FRN-2024-1050', quantidade: 45, unidade: 'kg', fornecedor: 'Merck KGaA', createdAt: new Date('2024-05-20') },
    { id: 'ins10', loteId: 'l6', nomeInsumo: 'Vitamina C (Ácido Ascórbico)', codigoInsumo: 'INS-VTC-01', loteInsumo: 'FRN-2024-1210', quantidade: 25, unidade: 'kg', fornecedor: 'DSM Nutritional', createdAt: new Date('2024-06-01') },
    { id: 'ins11', loteId: 'l7', nomeInsumo: 'Ibuprofeno PA', codigoInsumo: 'INS-IBU-01', loteInsumo: 'FRN-2024-1103', quantidade: 14, unidade: 'kg', fornecedor: 'Basf Química', createdAt: new Date('2024-06-10') },
  ];

  readonly inspecoes: InspecaoLote[] = [
    { id: 'insp1', loteId: 'l1', inspetor: 'Dra. Fernanda Costa', dataInspecao: new Date('2024-04-15T16:30:00'), resultado: 'aprovado', createdAt: new Date('2024-04-15') },
    { id: 'insp2', loteId: 'l2', inspetor: 'Dr. Marcos Alves', dataInspecao: new Date('2024-04-16T17:00:00'), resultado: 'aprovado', createdAt: new Date('2024-04-16') },
    { id: 'insp3', loteId: 'l3', inspetor: 'Dra. Fernanda Costa', dataInspecao: new Date('2024-05-03T09:15:00'), resultado: 'aprovado_com_restricao', qtdReprovada: 200, desvio: 'Variação de dureza fora da especificação em 0,8% das amostras. Lotes segregados para reprocessamento.', createdAt: new Date('2024-05-03') },
    { id: 'insp4', loteId: 'l4', inspetor: 'Dr. Marcos Alves', dataInspecao: new Date('2024-05-11T14:20:00'), resultado: 'reprovado', qtdReprovada: 850, desvio: 'Contaminação cruzada detectada nos testes microbiológicos. Lote deve ser descartado conforme POP-QA-007.', createdAt: new Date('2024-05-11') },
    { id: 'insp5', loteId: 'l5', inspetor: 'Dra. Fernanda Costa', dataInspecao: new Date('2024-05-21T11:00:00'), resultado: 'aprovado', createdAt: new Date('2024-05-21') },
    { id: 'insp6', loteId: 'l7', inspetor: 'Dr. Marcos Alves', dataInspecao: new Date('2024-06-11T15:30:00'), resultado: 'aprovado', createdAt: new Date('2024-06-11') },
  ];

  lotes: Lote[] = [
    { id: 'l1', numero: 'BT1-20240415-0001', produtoId: 'p1', dataProd: new Date('2024-04-15'), turno: 'manha', operador: 'José Pereira', qtdProduzida: 50000, status: 'aprovado', createdAt: new Date('2024-04-15'), updatedAt: new Date('2024-04-15') },
    { id: 'l2', numero: 'BT1-20240416-0002', produtoId: 'p2', dataProd: new Date('2024-04-16'), turno: 'tarde', operador: 'Maria Santos', qtdProduzida: 30000, status: 'aprovado', createdAt: new Date('2024-04-16'), updatedAt: new Date('2024-04-16') },
    { id: 'l3', numero: 'BT1-20240502-0003', produtoId: 'p1', dataProd: new Date('2024-05-02'), turno: 'noite', operador: 'José Pereira', qtdProduzida: 48000, qtdReprovada: 200, status: 'aprovado_com_restricao', createdAt: new Date('2024-05-02'), updatedAt: new Date('2024-05-03') },
    { id: 'l4', numero: 'BT1-20240510-0004', produtoId: 'p4', dataProd: new Date('2024-05-10'), turno: 'manha', operador: 'Carlos Lima', qtdProduzida: 2000, qtdReprovada: 850, status: 'reprovado', observacoes: 'Lote reprovado por contaminação. Em processo de descarte.', createdAt: new Date('2024-05-10'), updatedAt: new Date('2024-05-11') },
    { id: 'l5', numero: 'BT1-20240520-0005', produtoId: 'p5', dataProd: new Date('2024-05-20'), turno: 'tarde', operador: 'Ana Ramos', qtdProduzida: 500, status: 'aprovado', createdAt: new Date('2024-05-20'), updatedAt: new Date('2024-05-21') },
    { id: 'l6', numero: 'BT1-20240601-0006', produtoId: 'p2', dataProd: new Date('2024-06-01'), turno: 'manha', operador: 'Maria Santos', qtdProduzida: 32000, status: 'aguardando_inspecao', createdAt: new Date('2024-06-01'), updatedAt: new Date('2024-06-01') },
    { id: 'l7', numero: 'BT1-20240610-0007', produtoId: 'p1', dataProd: new Date('2024-06-10'), turno: 'tarde', operador: 'José Pereira', qtdProduzida: 52000, status: 'aprovado', createdAt: new Date('2024-06-10'), updatedAt: new Date('2024-06-11') },
    { id: 'l8', numero: 'BT1-20240620-0008', produtoId: 'p3', dataProd: new Date('2024-06-20'), turno: 'noite', operador: 'Carlos Lima', qtdProduzida: 1200, status: 'aguardando_inspecao', createdAt: new Date('2024-06-20'), updatedAt: new Date('2024-06-20') },
    { id: 'l9', numero: 'BT1-20240625-0009', produtoId: 'p5', dataProd: new Date('2024-06-25'), turno: 'manha', operador: 'Ana Ramos', qtdProduzida: 480, status: 'em_producao', createdAt: new Date('2024-06-25'), updatedAt: new Date('2024-06-25') },
    { id: 'l10', numero: 'BT1-20240626-0010', produtoId: 'p2', dataProd: new Date('2024-06-26'), turno: 'tarde', operador: 'Maria Santos', qtdProduzida: 28000, status: 'em_producao', createdAt: new Date('2024-06-26'), updatedAt: new Date('2024-06-26') },
  ];

  getLoteCompleto(id: string): Lote | undefined {
    const lote = this.lotes.find(l => l.id === id);
    if (!lote) return undefined;
    return {
      ...lote,
      produto: this.produtos.find(p => p.id === lote.produtoId),
      insumos: this.insumos.filter(i => i.loteId === id),
      inspecao: this.inspecoes.find(i => i.loteId === id),
    };
  }

  getLotesComProduto(): Lote[] {
    return this.lotes.map(l => ({
      ...l,
      produto: this.produtos.find(p => p.id === l.produtoId),
    }));
  }

  getDashboardMetrics(): DashboardMetrics {
    const hoje = new Date();
    const hojeStr = hoje.toDateString();
    const lotesHoje = this.lotes.filter(l => l.createdAt.toDateString() === hojeStr);
    const inspecoesDoMes = this.inspecoes.filter(i => i.dataInspecao.getMonth() === hoje.getMonth());
    const aprovados = inspecoesDoMes.filter(i => i.resultado !== 'reprovado').length;
    const taxa = inspecoesDoMes.length > 0 ? Math.round((aprovados / inspecoesDoMes.length) * 100) : 0;
    return {
      lotesHoje: lotesHoje.length || 2,
      unidadesHoje: lotesHoje.reduce((a, b) => a + b.qtdProduzida, 0) || 28480,
      taxaAprovacaoMes: taxa || 83,
      lotesAguardandoInspecao: this.lotes.filter(l => l.status === 'aguardando_inspecao').length,
    };
  }

  gerarNumeroLote(produtoId: string): string {
    const produto = this.produtos.find(p => p.id === produtoId);
    const prefixo = produto ? produto.codigo.replace('PRD-', 'BT') : 'BTX';
    const date = new Date();
    const yyyymmdd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const seq = String(this.lotes.length + 1).padStart(4, '0');
    return `${prefixo}-${yyyymmdd}-${seq}`;
  }
}
