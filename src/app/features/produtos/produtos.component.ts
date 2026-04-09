import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProdutoApi,
  ProdutoApiService,
} from '../../core/services/produto-api.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos.component.html',
})
export class ProdutosComponent implements OnInit {
  private produtoApi = inject(ProdutoApiService);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  produtos = signal<ProdutoApi[]>([]);
  editandoId = signal<string | null>(null);

  form = {
    codigo: '',
    nome: '',
    descricao: '',
    linha: '',
  };

  async ngOnInit() {
    await this.carregarProdutos();
  }

  async carregarProdutos() {
    try {
      this.loading.set(true);
      this.error.set(null);

      const response = await this.produtoApi.list();
      this.produtos.set(response);
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível carregar os produtos.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  novoProduto() {
    this.editandoId.set(null);
    this.form = {
      codigo: '',
      nome: '',
      descricao: '',
      linha: '',
    };
    this.success.set(null);
    this.error.set(null);
  }

  editarProduto(produto: ProdutoApi) {
    this.editandoId.set(String(produto.id));
    this.form = {
      codigo: produto.codigo,
      nome: produto.nome,
      descricao: produto.descricao ?? '',
      linha: produto.linha,
    };
    this.success.set(null);
    this.error.set(null);
  }

  async salvar() {
    if (!this.form.codigo || !this.form.nome || !this.form.linha) {
      this.error.set('Código, nome e linha são obrigatórios.');
      return;
    }

    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const payload = {
        codigo: this.form.codigo.trim(),
        nome: this.form.nome.trim(),
        descricao: this.form.descricao.trim() || null,
        linha: this.form.linha.trim(),
      };

      if (this.editandoId()) {
        await this.produtoApi.update(this.editandoId()!, payload);
        this.success.set('Produto atualizado com sucesso.');
      } else {
        await this.produtoApi.create(payload);
        this.success.set('Produto criado com sucesso.');
      }

      this.novoProduto();
      await this.carregarProdutos();
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível salvar o produto.'
      );
    } finally {
      this.saving.set(false);
    }
  }

  async toggleAtivo(produto: ProdutoApi) {
    try {
      this.error.set(null);
      this.success.set(null);

      if (produto.ativo) {
        await this.produtoApi.inativar(String(produto.id));
        this.success.set('Produto inativado com sucesso.');
      } else {
        await this.produtoApi.reativar(String(produto.id));
        this.success.set('Produto reativado com sucesso.');
      }

      await this.carregarProdutos();
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível alterar o status do produto.'
      );
    }
  }
}