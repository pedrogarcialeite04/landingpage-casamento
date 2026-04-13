# Convite Digital - Estrutura do Projeto

## Pastas principais

- `api/`: backend serverless (Vercel Functions)
- `frontend/pages/`: páginas HTML (`index` e `admin`)
- `frontend/styles/`: arquivos CSS
- `frontend/scripts/`: arquivos JavaScript do frontend
- `frontend/assets/`: imagens utilizadas no projeto

## Rotas principais

- `/` -> convite
- `/admin` -> painel administrativo
- `/api/health` -> status da API
- `/api/rsvp` -> criação e listagem de confirmações
- `/api/rsvp/:id` -> exclusão de confirmação

## Variáveis de ambiente

Use o arquivo `.env.example` como base:

- `MONGO_URI`
- `ADMIN_TOKEN`
- `ALLOWED_ORIGINS`
