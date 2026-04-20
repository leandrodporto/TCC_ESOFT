<p align="center">
  <img src="https://img.shields.io/badge/TCC-ESOFT-0f172a?style=for-the-badge&labelColor=111827" alt="Projeto" />
  <img src="https://img.shields.io/badge/React-19-2563eb?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-16a34a?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Prisma-PostgreSQL-0891b2?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
</p>

<h1 align="center">Sistema de Gestao de Logistica Eleitoral</h1>

<p align="center">
  Planejamento de pontos de transmissao, cartorios e locais de votacao com mapa interativo e calculo de rotas.
</p>

---

## Visao geral

Este repositorio contem duas aplicacoes:

- `backend`: API REST em Express com persistencia via Prisma + PostgreSQL.
- `frontend`: SPA em React + Vite com visualizacao em mapa (Leaflet).

A proposta e centralizar dados operacionais (usuarios, municipios, cartorios, locais de votacao e rotas), com suporte a geocodificacao e integracoes externas para calculo de distancias.

## Arquitetura em 30 segundos

```mermaid
flowchart LR
    FE[Frontend React + Vite] --> API[API Express]
    API --> DB[(PostgreSQL)]
    API --> PRISMA[Prisma Client]
    PRISMA --> DB

    API --> GEO[Google Geocoding]
    API --> DIST[Google Distance Matrix]
    API --> OSRM[OSRM]

    FE --> MAP[Leaflet / React-Leaflet]
```

## Stack tecnica

| Camada      | Tecnologias                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| Frontend    | React 19, Vite 8, React Router 7, Leaflet, Axios                              |
| Backend     | Node.js, Express 5, Prisma 7, JWT, bcrypt                                     |
| Banco       | PostgreSQL                                                                    |
| Integracoes | ViaCEP, BrasilAPI, AwesomeAPI, Google Geocoding, Google Distance Matrix, OSRM |

## Estrutura do projeto

```text
TCC_ESOFT/
|- backend/
|  |- prisma/
|  |- src/
|  |  |- controllers/
|  |  |- routes/
|  |  |- services/
|  |  |- lib/
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- services/
```

## Como rodar localmente

### 1) Instalar dependencias

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Configurar variaveis de ambiente

Backend (`backend/.env`):

```env
PORT=3000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/tcc_esoft
JWT_SECRET=sua_chave_aqui
```

Frontend (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost
VITE_API_PORT=3000
```

### 3) Rodar migracoes do banco

```bash
cd backend
npx prisma migrate dev
```

### 4) Subir backend e frontend

Em um terminal:

```bash
cd backend
npm run dev
```

Em outro terminal:

```bash
cd frontend
npm run dev
```

## Endpoints base da API

- `/auth`
- `/users`
- `/notary-offices`
- `/municipalities`
- `/voting-places`

## Telas principais

- Dashboard de operacao
- Gestao de municipios
- Gestao de cartorios
- Gestao de locais de votacao
- Gestao de usuarios
- Visao de rotas

## Firulas tecnicas

- Queda elegante no calculo de distancias: Google Distance Matrix -> OSRM -> Haversine.
- Persistencia com Prisma Adapter para PostgreSQL.
- Mapa com fluxo visual de pontos, secoes e eleitores.

---

Feito para apoiar operacao eleitoral com foco em rastreabilidade, velocidade e clareza no campo.
