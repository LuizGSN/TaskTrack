# TO-DO LIST (TESTE-TECNICO)

> Aplicação fullstack de gerenciamento de tarefas com API REST, CRUD completo e interface web simples para consumo da API.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?style=for-the-badge&logo=css3)

## ✨ Funcionalidades

- **CRUD completo** — criar, listar, buscar, editar e excluir tarefas
- **Filtros de listagem** — filtrar por status, buscar por texto e ordenar resultados
- **Prioridade urgente** — tarefas podem receber destaque visual sem poluir a interface
- **Status da tarefa** — marcar como concluída ou voltar para pendente
- **Persistência real** — dados armazenados em banco PostgreSQL
- **API REST** — endpoints organizados para consumo pelo frontend
- **Interface React** — tela para listar, criar, editar, concluir e excluir tarefas
- **Validação de dados** — campos obrigatórios, limites de tamanho, status permitido e filtros válidos

## 🖥️ Demonstração

A aplicação possui uma tela principal com formulário de criação, lista de tarefas e ações rápidas para concluir, editar e excluir.

Fluxo principal:

1. Criar uma tarefa pelo formulário.
2. Visualizar a tarefa na lista.
3. Marcar como concluída ou pendente.
4. Editar título e descrição.
5. Excluir tarefa.

## 🛠️ Tecnologias

| Frontend | Backend | Banco/DevOps |
|---|---|---|
| React 19 | Node.js | PostgreSQL 18 |
| Vite 7 | Express 5 | Docker Compose |
| CSS | CORS | pg |
| Lucide React | dotenv | Git |

## 📋 Pré-requisitos

- Node.js >= 20
- npm
- PostgreSQL instalado localmente ou Docker

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/LuizGSN/TO-DO-LIST-TESTE-TECNICO.git
cd TO-DO-LIST-TESTE-TECNICO
```

Se você já está com a pasta do projeto aberta, apenas siga para o próximo passo.

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o backend

Crie o arquivo `.env` a partir do exemplo:

```bash
copy server\.env.example server\.env
```

Configure a conexão com o PostgreSQL:

```env
DATABASE_URL=postgres://postgres:sua_senha@localhost:5432/todo_desafio
PORT=3333
```

### 4. Configure o banco de dados

Com PostgreSQL local:

```sql
CREATE DATABASE todo_desafio;
```

Ou use Docker:

```bash
docker compose up -d
```

### 5. Execute a migration

```bash
npm run db:migrate
```

### 6. Rode a aplicação

```bash
npm run dev
```

A aplicação estará disponível em:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3333`

## 🐳 Rodar com Docker

O projeto inclui um `docker-compose.yml` para subir o PostgreSQL com as credenciais padrão do `.env.example`.

```bash
docker compose up -d
npm run db:migrate
npm run dev
```

## 📁 Estrutura do Projeto

```text
todo-list-api/
├── .gitignore
├── docker-compose.yml
├── package.json
├── README.md
│
├── client/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── api.js          # Funções para consumir a API
│       ├── main.jsx        # Aplicação React
│       └── styles.css      # Estilos da interface
│
└── server/
    ├── .env.example        # Variáveis de ambiente modelo
    ├── package.json
    ├── db/
    │   ├── migrate.js      # Script de migration
    │   └── schema.sql      # Criação da tabela tasks
    └── src/
        ├── db.js           # Pool PostgreSQL
        ├── server.js       # Entry point + rotas da API
        ├── tasksRepository.js
        └── validation.js   # Validações de entrada
```

## 🔌 API Endpoints

URL base local:

```text
http://localhost:3333
```

### Health Check

| Método | Path | Descrição |
|---|---|---|
| `GET` | `/health` | Verifica se a API está online |

Resposta:

```json
{
  "status": "ok"
}
```

### Tarefas

| Método | Path | Descrição |
|---|---|---|
| `GET` | `/tasks` | Listar todas as tarefas |
| `GET` | `/tasks/:id` | Buscar uma tarefa por ID |
| `POST` | `/tasks` | Criar uma tarefa |
| `PUT` | `/tasks/:id` | Atualizar uma tarefa completa |
| `PATCH` | `/tasks/:id` | Atualizar parcialmente uma tarefa |
| `DELETE` | `/tasks/:id` | Excluir uma tarefa |

### Filtros de Listagem

O endpoint `GET /tasks` aceita filtros via query params:

| Parâmetro | Valores | Descrição |
|---|---|---|
| `status` | `pending`, `completed` | Filtra tarefas por status |
| `priority` | `normal`, `urgent` | Filtra tarefas por prioridade |
| `search` | texto com até 80 caracteres | Busca no título e na descrição |
| `sort` | `createdAt`, `updatedAt`, `title`, `status`, `priority` | Campo usado na ordenação |
| `order` | `asc`, `desc` | Direção da ordenação |

Exemplo:

```bash
curl "http://localhost:3333/tasks?status=pending&priority=urgent&search=readme&sort=title&order=asc"
```

### Modelo de Tarefa

```json
{
  "id": 1,
  "title": "Estudar Express",
  "description": "Criar endpoints REST",
  "status": "pending",
  "priority": "urgent",
  "createdAt": "2026-05-13T19:13:14.140Z",
  "updatedAt": "2026-05-13T19:13:14.140Z"
}
```

Status aceitos:

- `pending` — tarefa pendente
- `completed` — tarefa concluída

Prioridades aceitas:

- `normal` — tarefa comum
- `urgent` — tarefa urgente com destaque visual

## ✅ Validações

### Corpo das requisições

| Campo | Regra |
|---|---|
| `title` | Obrigatório, texto e no máximo 120 caracteres |
| `description` | Opcional, texto e no máximo 500 caracteres |
| `status` | Opcional, apenas `pending` ou `completed` |
| `priority` | Opcional, apenas `normal` ou `urgent` |

Campos não previstos no corpo da requisição são rejeitados.

### Parâmetros de rota e filtros

- `id` deve ser um número inteiro positivo.
- `status` deve ser `pending` ou `completed`.
- `priority` deve ser `normal` ou `urgent`.
- `search` deve ter no máximo 80 caracteres.
- `sort` deve ser `createdAt`, `updatedAt`, `title`, `status` ou `priority`.
- `order` deve ser `asc` ou `desc`.

## 🧪 Exemplos de Uso

### Criar tarefa

```bash
curl -X POST http://localhost:3333/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Estudar Express\",\"description\":\"Criar endpoints REST\",\"status\":\"pending\",\"priority\":\"urgent\"}"
```

Resposta:

```json
{
  "id": 1,
  "title": "Estudar Express",
  "description": "Criar endpoints REST",
  "status": "pending",
  "priority": "urgent",
  "createdAt": "2026-05-13T19:13:14.140Z",
  "updatedAt": "2026-05-13T19:13:14.140Z"
}
```

### Listar tarefas

```bash
curl http://localhost:3333/tasks
```

Com filtros:

```bash
curl "http://localhost:3333/tasks?status=completed&priority=urgent&sort=updatedAt&order=desc"
```

Resposta:

```json
[
  {
    "id": 1,
    "title": "Estudar Express",
    "description": "Criar endpoints REST",
    "status": "pending",
    "priority": "urgent",
    "createdAt": "2026-05-13T19:13:14.140Z",
    "updatedAt": "2026-05-13T19:13:14.140Z"
  }
]
```

### Buscar tarefa por ID

```bash
curl http://localhost:3333/tasks/1
```

### Atualizar tarefa completa

```bash
curl -X PUT http://localhost:3333/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Estudar React\",\"description\":\"Consumir a API no frontend\",\"status\":\"completed\",\"priority\":\"normal\"}"
```

### Marcar tarefa como concluída

```bash
curl -X PATCH http://localhost:3333/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"completed\"}"
```

### Marcar tarefa como urgente

```bash
curl -X PATCH http://localhost:3333/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"priority\":\"urgent\"}"
```

### Excluir tarefa

```bash
curl -X DELETE http://localhost:3333/tasks/1
```

Resposta:

```http
204 No Content
```

## ⚠️ Tratamento de Erros

Formato padrão:

```json
{
  "errors": ["Mensagem do erro."]
}
```

| Código | Quando acontece |
|---|---|
| `400 Bad Request` | Dados inválidos, ID inválido, status inválido ou prioridade inválida |
| `404 Not Found` | Tarefa não encontrada |
| `500 Internal Server Error` | Erro inesperado no servidor |

Exemplo:

```json
{
  "errors": ["O título é obrigatório."]
}
```

## 🌐 Deploy

Sugestão de deploy:

### Backend — Render ou Railway

1. Crie um serviço web apontando para a pasta `server/`.
2. Configure a variável `DATABASE_URL` com a string de conexão do PostgreSQL.
3. Configure `PORT` conforme a plataforma, se necessário.
4. Rode a migration no ambiente de produção.

### Frontend — Vercel ou Netlify

1. Crie o projeto apontando para a pasta `client/`.
2. Configure a variável `VITE_API_URL` com a URL pública do backend.
3. Faça o deploy.

## 📝 Licença

Este projeto foi desenvolvido para fins de desafio técnico.

---

Desenvolvido por [Luiz Gonzaga](https://github.com/LuizGSN) — Estudante de Análise e Desenvolvimento de Sistemas
