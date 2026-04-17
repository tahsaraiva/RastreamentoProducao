# 🌿 Iandê Trace — Sistema de Rastreabilidade de Produção

> **"O sinal da sua produção"** — Rastreabilidade industrial com identidade amazônica e conformidade LGPD

Sistema web de rastreamento de produção por lote desenvolvido com **Angular 17** (standalone components, signals) e **Tailwind CSS 3**, integrado com backend **Node.js + Express + TypeORM + PostgreSQL**.

---

## 🚀 Setup rápido

### Pré-requisitos

- Node.js 18+ / 20+
- npm 9+
- Docker Desktop

### 1. Clone o repositório

```bash
git clone https://github.com/tahsaraiva/RastreamentoProducao.git
cd RastreamentoProducao
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm start
```

Acesse: **http://localhost:4200**

---

## 🔧 Backend

O frontend consome a API REST do projeto **projeto08-rastreamento-backend**.

### Subindo o backend

```bash
# 1. Clone o backend
git clone https://github.com/luizhlima/projeto08-rastreamento-backend.git
cd projeto08-rastreamento-backend

# 2. Configure o .env
copy .env.example .env
# Edite o .env com suas credenciais

# 3. Suba o banco de dados com Docker
docker-compose up -d

# 4. Crie o banco de dados
docker exec -it indt_postgres psql -U postgres -c "CREATE DATABASE indt_lote_pim;"

# 5. Instale as dependências
npm install

# 6. Execute o seed (cria tabelas e dados iniciais)
npm run seed

# 7. Inicie o servidor
npm run dev
```

O backend ficará disponível em: **http://localhost:3000**

### Variáveis de ambiente (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=indt_lote_pim
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=Admin@2026
JWT_ACCESS_SECRET=sua_chave_secreta_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_aqui
PORT=3000
```

---

## 🔑 Credenciais de demonstração

| E-mail | Senha | Perfil |
|--------|-------|--------|
| gestor@iande.com | 123456 | Gestor de Qualidade |
| inspetor@iande.com | 123456 | Inspetor de Qualidade |
| operador@iande.com | 123456 | Operador de Linha |

---

## 👥 Perfis e permissões

### 🏭 Operador de Linha
Acesso restrito às funcionalidades de produção:
- **Lotes** — abre lote no início do turno, registra insumos utilizados e encerra ao final com quantidade produzida
- **Produtos** — consulta produtos cadastrados

### 🔬 Inspetor de Qualidade
Acesso restrito à inspeção:
- **Lotes** — visualiza lotes aguardando inspeção e registra o resultado (aprovado, aprovado com restrição, reprovado) com descrição do desvio

### 📊 Gestor de Qualidade / Produção
Acesso completo ao sistema:
- **Dashboard** — visão geral da produção com métricas, gráficos interativos e lotes por dia
- **Lotes** — consulta e acompanhamento de todos os lotes
- **Rastreabilidade** — consulta completa com linha do tempo e busca reversa de impacto

> Cada perfil é redirecionado automaticamente para sua tela principal após o login.

---

## 📱 Telas disponíveis

| Rota | Tela | Perfil |
|------|------|--------|
| `/login` | Login com formulário reativo e LGPD | Todos |
| `/app/dashboard` | Dashboard com métricas e gráficos interativos | Gestor |
| `/app/lotes` | Listagem com filtros e badges de status | Todos |
| `/app/lotes/novo` | Formulário de abertura de lote | Operador, Gestor |
| `/app/lotes/:id` | Detalhe do lote com insumos e inspeção | Todos |
| `/app/lotes/:id/insumos` | Gerenciamento de insumos do lote | Operador, Gestor |
| `/app/lotes/:id/inspecao` | Registro de inspeção de qualidade | Inspetor, Gestor |
| `/app/rastreabilidade` | Consulta de rastreabilidade com linha do tempo | Gestor |
| `/app/produtos` | Gestão de produtos cadastrados | Operador, Gestor |

---

## 🔍 Como usar a Rastreabilidade

### Rastreio direto (lote → insumos)
1. Acesse **Rastreabilidade** (perfil Gestor)
2. Selecione **"Por lote"** e digite o número: `LOT-2026-00001`
3. Visualize todos os dados do lote, linha do tempo completa e insumos utilizados

### Consulta reversa — impacto de insumo suspeito
1. Selecione **"Por insumo"** e digite o código: `INS-001`
2. O sistema identifica em segundos todos os lotes que utilizaram aquele insumo
3. Ideal para cenários de **recall** ou **auditoria**

### Linha do tempo do lote
A rastreabilidade exibe uma linha do tempo cronológica com:
- 📦 Abertura do lote (operador, linha, turno, data/hora)
- 🔗 Insumos vinculados
- ✅ Encerramento do lote
- 🔬 Inspeção de qualidade (inspetor, resultado, desvio)
- 🏁 Status final

---

## 📊 Dashboard (Gestor)

- **4 cards de métricas**: lotes hoje, unidades hoje, taxa de aprovação, aguardando inspeção
- **Gráfico de barras**: lotes produzidos nos últimos 7 dias — **clicável por dia**
- **Gráfico de rosca**: distribuição por status dos lotes
- **Gráfico de linha**: evolução da taxa de aprovação nos últimos 6 meses
- **Tabela de últimos lotes**: com links para detalhes

> Clique em qualquer barra do gráfico para ver os lotes daquele dia específico.

---

## 🔒 Conformidade LGPD

O sistema implementa os direitos dos titulares conforme a **Lei 13.709/2018**:

- 📋 Solicitação de dados pessoais (SAR)
- ⬇️ Portabilidade dos dados (Download)
- 🗑️ Direito ao esquecimento
- 📜 Log de acessos
- 📄 Política de Privacidade
- 🔴 Revogação de consentimento
- 📧 Contato com o DPO: dpo@iande.com

Acessível pelo botão flutuante 🔒 em todas as telas.

---

## 🏗️ Arquitetura do Frontend

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts          # authGuard, noAuthGuard, gestorGuard, inspetorGuard, operadorGuard
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # JWT Bearer + refresh token
│   └── services/
│       ├── auth.service.ts        # Signals: user, isAuth, perfil, token, refreshToken
│       ├── dashboard-api.service.ts
│       ├── lote-api.service.ts
│       ├── insumo-api.service.ts
│       ├── inspecao-api.service.ts
│       ├── produto-api.service.ts
│       └── rastreabilidade-api.service.ts
│
├── shared/
│   ├── models/                    # Interfaces e tipos
│   └── components/
│       ├── layout/                # Topbar + menu LGPD + nav por perfil
│       └── redirect/              # Redirecionamento automático por perfil
│
└── features/
    ├── auth/login/                # Login com LGPD
    ├── dashboard/                 # Dashboard com Chart.js
    ├── lotes/
    │   ├── lote-list/             # Listagem com filtros
    │   ├── lote-form/             # Abertura de lote
    │   └── lote-detail/           # Detalhe completo
    ├── insumos/                   # Vínculo de insumos
    ├── inspecao/                  # Registro de inspeção
    ├── produtos/                  # Gestão de produtos
    └── rastreabilidade/           # Consulta com linha do tempo
```

---

## 🎨 Design — Identidade Iandê Trace

| Elemento | Valor |
|----------|-------|
| **Tema** | Dark — fundo `#0F172A` → `#1E293B` |
| **Cor principal** | Teal `#00B4D8` |
| **Cor secundária** | Azul `#1A5F7A` |
| **Verde amazônico** | `#1B5E20` |
| **Fonte** | Inter (Google Fonts) |
| **Cards** | Glass morphism com `backdrop-filter: blur` |
| **Badges** | Status coloridos com transparência |
| **Animações** | fadeIn, slideUp, float, shimmer |

---

## ✨ Funcionalidades implementadas

- ✅ **AuthService com Angular Signals** — `user`, `isAuth`, `perfil`, `token`, `refreshToken`
- ✅ **Guards por perfil** — gestor, operador, inspetor
- ✅ **Redirecionamento automático** por perfil após login
- ✅ **HTTP Interceptor** — injeta Bearer token, refresh automático e trata 401
- ✅ **Login reativo** com validação, toggle senha e consentimento LGPD
- ✅ **Dashboard interativo** com Chart.js — clique nas barras para filtrar por dia
- ✅ **Abertura de lote** com número gerado automaticamente pelo backend
- ✅ **Filtros** por número, produto e status na listagem
- ✅ **Badges de status** coloridos em todas as telas
- ✅ **Encerramento de lote** com transição de status automática
- ✅ **Insumos** — adicionar e remover (somente em produção)
- ✅ **Inspeção** com validação condicional por resultado
- ✅ **Rastreabilidade direta** — lote → insumos + linha do tempo
- ✅ **Rastreabilidade reversa** — insumo → todos os lotes afetados
- ✅ **Linha do tempo** — abertura, insumos, encerramento, inspeção, status final
- ✅ **Gestão de produtos** — criar, editar, inativar/reativar
- ✅ **Menu LGPD flutuante** — direitos do titular em todas as telas
- ✅ **Lazy loading** em todas as rotas
- ✅ **Standalone components** Angular 17

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Angular | 17 | Framework principal |
| Tailwind CSS | 3 | Estilização |
| Chart.js | 4 | Gráficos do dashboard |
| TypeScript | 5.4 | Linguagem |
| Node.js + Express | 5 | Backend API |
| TypeORM | 0.3 | ORM |
| PostgreSQL | 18 | Banco de dados |
| Docker | — | Infraestrutura do banco |
| JWT | — | Autenticação |

---

## 👨‍💻 Equipe

 - Erika Dilliany Gaya Rabelo Dos Santos
 - Luiz Henrique Chagas De Lima
 - Talita Saraiva Teixeira Nosse

Projeto Final — Curso de Desenvolvimento Web Full Stack  
**Instituto Nokia de Tecnologia (INDT)** — Manaus, AM

---

*🌿 Iandê Trace — Rastreabilidade com identidade amazônica | 🔒 Conformidade LGPD — Lei 13.709/2018*
