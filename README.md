# RastreamentoProducao
Frontend do trabalho final do curso de web full stack do INDT

#Rastreamento de Produção por Lote

Sistema de rastreamento de produção por lote desenvolvido com **Angular 17** (standalone components, signals) e **Tailwind CSS 3**.

---

## 🚀 Setup rápido

### Pré-requisitos
- Node.js 18+ / 20+
- npm 9+

### Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm start
```

Acesse: **http://localhost:4200**

---

## 🔑 Credenciais de demonstração

| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@rastreamento.com | 123456 | Admin |
| gestor@rastreamento.com | 123456 | Gestor |
| operador@rastreamento.com | 123456 | Operador |

---

## 📱 Telas disponíveis

| Rota | Tela |
|------|------|
| `/login` | Login com formulário reativo |
| `/app/dashboard` | Dashboard com métricas e últimos lotes |
| `/app/lotes` | Listagem com filtros e badges de status |
| `/app/lotes/novo` | Formulário de abertura de lote |
| `/app/lotes/:id` | Detalhe do lote com insumos e inspeção |
| `/app/lotes/:id/insumos` | Gerenciamento de insumos do lote |
| `/app/lotes/:id/inspecao` | Registro de inspeção de qualidade |
| `/app/rastreabilidade` | Consulta de rastreabilidade (lote e reversa) |

---

## 🔍 Como demonstrar a rastreabilidade

### Rastreio por lote (dado um lote → ver insumos)
1. Acesse **Rastreabilidade**
2. Digite: `BT1-20240415-0001`
3. Ver todos os insumos usados, com lote de origem e fornecedor

### Consulta reversa (dado insumo suspeito → lotes afetados)
1. Acesse **Rastreabilidade**  
2. Digite: `INS-IBU-01` (código do insumo)
3. Sistema lista todos os lotes que usaram aquele insumo — ideal para cenário de **recall**

### Por lote de insumo específico
1. Digite: `FRN-2024-1103`
2. Ver todos os lotes que receberam esse lote específico de insumo

---

## 🏗️ Arquitetura

```
src/app/
├── core/
│   ├── guards/          # authGuard, noAuthGuard
│   ├── interceptors/    # authInterceptor (JWT)
│   └── services/
│       ├── auth.service.ts      # Signals: user, isAuth, perfil
│       └── mock-data.service.ts # Dados de demonstração
│
├── shared/
│   ├── models/          # Interfaces, enums, helpers
│   └── components/
│       └── layout/      # Shell com sidebar
│
└── features/
    ├── auth/login/      # Tela 1: Login
    ├── dashboard/       # Tela 2: Dashboard
    ├── lotes/
    │   ├── lote-list/   # Tela 3: Listagem com filtros
    │   ├── lote-form/   # Tela 3: Formulário de abertura
    │   └── lote-detail/ # Tela 4: Detalhe do lote
    ├── insumos/         # Tela 5: Vínculo de insumos
    ├── inspecao/        # Tela 6: Registro de inspeção
    └── rastreabilidade/ # Tela 7: Consulta de rastreabilidade
```

---

## ✨ Funcionalidades implementadas

- ✅ **AuthService com Angular Signals** — `user`, `isAuth`, `perfil`, `token`
- ✅ **authGuard** e **noAuthGuard** funcionais
- ✅ **HTTP Interceptor** — injeta Bearer token e trata 401
- ✅ **Login reativo** com validação em tempo real e toggle de senha
- ✅ **Número de lote gerado automaticamente** (formato: `BT{N}-YYYYMMDD-NNNN`)
- ✅ **Dashboard** com 4 métricas + tabela de últimos 10 lotes
- ✅ **Filtros** por número, produto e status na listagem
- ✅ **Badges de status** coloridos em todas as telas
- ✅ **Encerramento de lote** com transição de status automática
- ✅ **Insumos** — adicionar e remover (somente em produção)
- ✅ **Inspeção** com validação condicional por resultado
- ✅ **Rastreabilidade direta** — lote → insumos
- ✅ **Rastreabilidade reversa** — insumo → lotes afetados
- ✅ **Lazy loading** em todas as rotas
- ✅ **Standalone components** (Angular 17)
- ✅ **Dark theme** industrial com Tailwind CSS

---

## 🎨 Design

- **Tema:** Dark industrial — `slate-950` como base
- **Cor de marca:** Azul `brand-600` (#4f63f8)
- **Fontes:** DM Sans (corpo) + Sora (display) + JetBrains Mono (números/códigos)
- **Badges de status:** Azul / Amarelo / Verde / Laranja / Vermelho

---


O `authInterceptor` já injeta automaticamente o Bearer token em todas as requisições.

