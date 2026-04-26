# Desafio Dayvson

Aplicação full-stack desenvolvida para atender ao desafio técnico com foco em autenticação via JWT, controle de perfis, CRUDs principais, upload de arquivos, notificações, auditoria e execução local simplificada.

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Visão Geral</span></strong></summary>

O projeto é dividido em duas aplicações:

- `backend`: API em NestJS com Prisma e PostgreSQL
- `frontend`: interface em Next.js com TypeScript e `@uigovpe/components`

Principais entregas do sistema:

- autenticação com JWT
- perfis `ADMIN` e `USER`
- CRUD de usuários
- CRUD de categorias
- CRUD de produtos
- upload de avatar e de imagem de produto
- favoritos em produtos
- notificações para interações relevantes
- área administrativa com resumo do sistema e consulta de auditoria
- estrutura Docker para subir banco, backend e frontend

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Stack Utilizada</span></strong></summary>

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Axios
- UI GovPE (`@uigovpe/components`)

### Backend

- NestJS 11
- Prisma
- PostgreSQL
- JWT
- bcrypt
- class-validator
- Multer para upload de arquivos

### Infraestrutura

- Docker
- Docker Compose

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Estrutura do Repositório</span></strong></summary>

```text
desafio-dayvson/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── uploads/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Documentação do Frontend</span></strong></summary>

O frontend foi construído com Next.js usando App Router e tem como base visual a biblioteca `UI GovPE`.

### Principais rotas

| Rota | Descrição |
| --- | --- |
| `/login` | tela de autenticação |
| `/dashboard` | painel inicial do usuário logado |
| `/usuarios` | gerenciamento de usuários, restrito a `ADMIN` |
| `/categorias` | listagem e manutenção de categorias |
| `/produtos` | listagem e manutenção de produtos |
| `/notificacoes` | central de notificações do usuário logado |
| `/relatorios/auditoria` | consulta administrativa de auditoria e exportação |
| `/perfil` | edição de informações do usuário e upload de avatar |

### Organização do frontend

- `src/app`: páginas da aplicação
- `src/services`: serviços de integração com a API
- `src/infrastructure/api/client.ts`: cliente Axios com injeção automática do token JWT
- `src/middleware.ts`: proteção de rotas por cookie `token`

### Fluxo de autenticação

- o login chama `POST /auth/login`
- o token JWT é salvo em cookie
- os dados básicos do usuário logado são persistidos em `localStorage`
- as requisições subsequentes enviam `Authorization: Bearer <token>`

### Serviços principais

- `auth.service.ts`: login, leitura da sessão e limpeza da sessão
- `users.service.ts`: CRUD de usuários e upload de avatar
- `categories.service.ts`: CRUD de categorias
- `products.service.ts`: CRUD de produtos e favoritos
- `notifications.service.ts`: listagem e leitura de notificações
- `admin.service.ts`: resumo administrativo
- `audit-reports.service.ts`: filtros, paginação e exportação de relatórios de auditoria

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Documentação do Backend</span></strong></summary>

O backend foi construído com NestJS e Prisma, usando PostgreSQL como banco de dados principal.

### Módulos principais

- `auth`: login e recuperação do usuário autenticado
- `users`: criação, consulta, atualização, remoção e avatar
- `categories`: CRUD de categorias
- `products`: CRUD de produtos, paginação, filtros, upload e favoritos
- `notifications`: listagem e marcação de notificações como lidas
- `admin`: resumo administrativo e consulta de auditoria
- `audit`: registro e leitura de logs de auditoria
- `files`: entrega segura de imagens da pasta `uploads`

### Autorização e perfis

- praticamente todas as rotas de negócio exigem autenticação via JWT
- o perfil `ADMIN` tem acesso à gestão de usuários e à área administrativa
- o perfil `USER` pode gerenciar os próprios recursos de negócio e interagir com produtos

### Uploads

Arquivos enviados pela aplicação ficam em:

- `backend/uploads/avatars`
- `backend/uploads/products`

As imagens podem ser acessadas por meio do endpoint:

- `GET /files/image?path=<caminho-do-arquivo>`

### Seed inicial

O projeto possui `seed` com criação automática do administrador inicial caso ainda não exista nenhum usuário com perfil `ADMIN`.

As credenciais do admin inicial são definidas pelas variáveis:

- `INITIAL_ADMIN_EMAIL`
- `INITIAL_ADMIN_PASSWORD`

Após subir o projeto e executar o seed, o usuário pode acessar o sistema usando exatamente os valores informados nessas duas variáveis.

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Modelagem de Dados Resumida</span></strong></summary>

As principais entidades do sistema são:

- `User`: usuários da plataforma, com perfil `ADMIN` ou `USER`
- `Category`: categorias criadas por usuários
- `Product`: produtos cadastrados pelos usuários
- `ProductCategory`: relação N para N entre produtos e categorias
- `Favorite`: favoritos de usuários em produtos
- `AuditLog`: registro de ações relevantes do sistema
- `Notification`: notificações persistidas para o dono de um recurso

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Como Executar o Projeto</span></strong></summary>

<details>
  <summary>Com Docker</summary>

1. Na raiz do projeto `desafio-dayvson/`, crie o arquivo `.env` com o seguinte conteúdo:

```env
DB_USER=admin_db
DB_PASSWORD=senha_super_forte
DB_NAME=desafio_db
DB_PORT=5432
DB_HOST=postgres-db
DATABASE_URL=postgresql://admin_db:senha_super_forte@postgres-db:5432/desafio_db?schema=public
JWT_SECRET=sua_chave_jwt_aqui
INITIAL_ADMIN_EMAIL=admin@email.com
INITIAL_ADMIN_PASSWORD=123456
NEXT_PUBLIC_API_URL=http://localhost:3000
```

2. Ajuste os valores conforme o ambiente que você deseja utilizar.
3. Execute o comando abaixo:

```bash
docker compose up --build -d
```

4. Aguarde a subida completa dos containers.

### O que acontece no fluxo Docker

- o PostgreSQL sobe primeiro
- o serviço `backend-init` aplica a estrutura do banco e roda o seed
- o backend sobe na porta `3000`
- o frontend sobe na porta `3001`

</details>

<details>
  <summary>Sem Docker</summary>

#### Backend

1. Entre na pasta `backend`:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `backend/.env` com o seguinte conteúdo e ajuste a `DATABASE_URL` conforme o banco que você estiver utilizando:

```env
DATABASE_URL=postgresql://admin_db:senha_super_forte@localhost:5432/desafio_db?schema=public
JWT_SECRET=sua_chave_jwt_aqui
INITIAL_ADMIN_EMAIL=admin@email.com
INITIAL_ADMIN_PASSWORD=123456
```

4. Gere o client do Prisma:

```bash
npx prisma generate
```

5. Rode as migrations:

```bash
npx prisma migrate deploy
```

6. Execute o seed:

```bash
npx prisma db seed
```

7. Inicie o backend:

```bash
npm run start:dev
```

#### Frontend

1. Em outro terminal, entre na pasta `frontend`:

```bash
cd frontend
```

2. Crie o arquivo `frontend/.env` com o seguinte conteúdo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Instale as dependências:

```bash
npm install
```

4. Inicie o frontend:

```bash
npm run dev
```

Observação: como o backend sobe na porta `3000`, o Next.js normalmente utilizará a próxima porta livre para o frontend, que costuma ser a `3001`.

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Como Testar o Projeto</span></strong></summary>

<details>
  <summary>Ver roteiro de testes</summary>

1. Acesse o frontend pela URL exibida no terminal do Next.js. Em ambiente local, normalmente ela será [http://localhost:3001](http://localhost:3001).
2. Entre no sistema com as credenciais definidas em `INITIAL_ADMIN_EMAIL` e `INITIAL_ADMIN_PASSWORD` no arquivo `backend/.env` ou no `.env` da raiz, se estiver usando Docker.
3. Navegue pelas páginas do sistema por meio do menu lateral para validar autenticação, permissões e carregamento das telas principais.
4. Cadastre categorias e produtos, incluindo upload de imagem, para validar formulários, persistência e exibição dos arquivos enviados.
5. Acesse `/dashboard` e `/relatorios/auditoria` para conferir os resumos administrativos, estatísticas e registros de auditoria.
6. Na tela de usuários, crie um novo usuário com perfil `USER`.
7. Encerre a sessão do administrador e entre novamente com o usuário `USER` criado no passo anterior.
8. Verifique se esse novo usuário consegue visualizar os produtos e categorias já criados pelo administrador.
9. Favorite produtos de outros usuários para validar a funcionalidade de favoritos.
10. Volte para a conta de administrador e confira a chegada das notificações relacionadas aos favoritos recebidos.
11. Acesse a tela de perfil, altere seus dados e envie uma imagem de avatar para validar a edição cadastral e o upload do usuário.

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Scripts Úteis</span></strong></summary>

### Backend

<details>
  <summary>Ver scripts do backend</summary>

```bash
npm run build
npm run start:dev
npm run test
```

</details>

### Frontend

<details>
  <summary>Ver scripts do frontend</summary>

```bash
npm run dev
npm run build
npm run start
```

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Documentação dos Endpoints</span></strong></summary>

Observação: no estado atual do projeto, a referência principal dos endpoints está neste README.

Base da API:

```text
http://localhost:3000
```

Para as rotas protegidas, envie o cabeçalho:

```http
Authorization: Bearer <token>
```

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Sistema e Arquivos</span></strong></summary>

<details>
  <summary>Ver endpoints de sistema e arquivos</summary>

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `GET` | `/` | não | endpoint base da aplicação |
| `GET` | `/files/image` | não | retorna uma imagem local da pasta `uploads` |

### Query params de `/files/image`

- `path`: caminho do arquivo dentro de `uploads`
- `download`: opcional; se `true`, força o download

Exemplo:

```http
GET /files/image?path=/uploads/products/imagem.png
```

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Autenticação</span></strong></summary>

<details>
  <summary>Ver endpoints de autenticação</summary>

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | não | realiza login e retorna token JWT |
| `GET` | `/auth/me` | sim | retorna o usuário autenticado |

### `POST /auth/login`

Body:

```json
{
  "email": "admin@email.com",
  "password": "123456"
}
```

Resposta esperada:

```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@email.com",
    "role": "ADMIN"
  }
}
```

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Usuários</span></strong></summary>

<details>
  <summary>Ver endpoints de usuários</summary>

Todas as rotas de usuários exigem autenticação. A gestão administrativa de usuários é restrita a `ADMIN`.

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| `POST` | `/users` | `ADMIN` | cria usuário |
| `GET` | `/users` | `ADMIN` | lista usuários |
| `GET` | `/users/:id` | `ADMIN` | busca usuário por ID |
| `PATCH` | `/users/:id` | `ADMIN` | atualiza usuário |
| `DELETE` | `/users/:id` | `ADMIN` | remove usuário |
| `PATCH` | `/users/me/avatar` | autenticado | envia avatar do usuário logado |

### `POST /users`

Body:

```json
{
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "123456",
  "role": "USER"
}
```

### `PATCH /users/:id`

Body parcial:

```json
{
  "name": "Novo Nome",
  "email": "novo@email.com",
  "password": "novaSenha",
  "role": "ADMIN"
}
```

### `PATCH /users/me/avatar`

Tipo de envio:

- `multipart/form-data`

Campo esperado:

- `file`

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Categorias</span></strong></summary>

<details>
  <summary>Ver endpoints de categorias</summary>

Todas as rotas de categorias exigem autenticação.

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| `POST` | `/categories` | autenticado | cria categoria |
| `GET` | `/categories` | autenticado | lista categorias |
| `GET` | `/categories/:id` | autenticado | busca categoria por ID |
| `PATCH` | `/categories/:id` | autenticado | atualiza categoria |
| `DELETE` | `/categories/:id` | autenticado | remove categoria |

### `POST /categories`

Body:

```json
{
  "name": "Eletrônicos",
  "description": "Produtos eletrônicos em geral"
}
```

### `PATCH /categories/:id`

Body parcial:

```json
{
  "name": "Informática",
  "description": "Categoria atualizada"
}
```

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Produtos</span></strong></summary>

<details>
  <summary>Ver endpoints de produtos</summary>

Todas as rotas de produtos exigem autenticação.

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| `POST` | `/products` | autenticado | cria produto com opção de imagem |
| `GET` | `/products` | autenticado | lista produtos com paginação e filtros |
| `GET` | `/products/me` | autenticado | lista os produtos do usuário logado |
| `GET` | `/products/:id` | autenticado | busca produto por ID |
| `PATCH` | `/products/:id` | autenticado | atualiza produto |
| `DELETE` | `/products/:id` | autenticado | remove produto |
| `POST` | `/products/:id/favorite` | autenticado | favorita produto |
| `DELETE` | `/products/:id/favorite` | autenticado | remove favorito |

### `GET /products`

Query params disponíveis:

- `page`
- `limit`
- `search`
- `categoryId`
- `ownerId`

### `GET /products/me`

Query params disponíveis:

- `page`
- `limit`
- `search`
- `categoryId`

### `POST /products`

Tipo de envio:

- `multipart/form-data`

Campos esperados:

- `name`
- `description` opcional
- `price` opcional
- `categoryIds` opcional, podendo ser lista JSON ou valores separados
- `file` opcional

Exemplo de campos:

```text
name=Notebook
description=Notebook para trabalho
price=4500.00
categoryIds=["uuid-da-categoria"]
file=<arquivo>
```

### `PATCH /products/:id`

Segue a mesma estrutura de `multipart/form-data` do cadastro, com todos os campos opcionais.

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Notificações</span></strong></summary>

<details>
  <summary>Ver endpoints de notificações</summary>

Todas as rotas exigem autenticação.

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| `GET` | `/notifications` | autenticado | lista as notificações do usuário logado |
| `PATCH` | `/notifications/:id/read` | autenticado | marca uma notificação como lida |

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Administração</span></strong></summary>

<details>
  <summary>Ver endpoints de administração</summary>

As rotas abaixo exigem autenticação e perfil `ADMIN`.

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| `GET` | `/admin/summary` | `ADMIN` | retorna totais do sistema |
| `GET` | `/admin/audit-logs` | `ADMIN` | retorna logs de auditoria com paginação |
| `GET` | `/admin/audit-reports` | `ADMIN` | retorna relatório de auditoria com filtros avançados |
| `GET` | `/admin/audit-reports/export` | `ADMIN` | exporta relatório de auditoria em CSV |

### `GET /admin/summary`

Resposta esperada:

```json
{
  "users": 10,
  "categories": 8,
  "products": 25,
  "favorites": 40
}
```

### `GET /admin/audit-logs`

Query params disponíveis:

- `page`
- `limit`

### `GET /admin/audit-reports`

Query params disponíveis:

- `page`
- `limit`
- `search`
- `action`
- `entityType`
- `actorId`
- `startDate`
- `endDate`

### `GET /admin/audit-reports/export`

Usa os mesmos filtros de `GET /admin/audit-reports` e retorna um arquivo CSV para download.

</details>

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Regras de Negócio Importantes</span></strong></summary>

- apenas usuários autenticados acessam as rotas principais do sistema
- apenas `ADMIN` pode criar, editar, listar e remover usuários pela API administrativa
- um usuário pode criar categorias e produtos
- um usuário pode visualizar produtos e categorias do sistema
- um usuário pode favoritar produtos de outros usuários
- interações relevantes em recursos de terceiros podem gerar notificações ao dono do recurso
- o seed inicial cria um administrador caso ainda não exista nenhum `ADMIN`

</details>

<details>
  <summary><strong><span style="color: #f97316; -webkit-text-stroke: 0.6px #000000; text-shadow: -1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000;">Observações Finais</span></strong></summary>

- o backend usa Prisma com PostgreSQL
- o frontend consome a API via `NEXT_PUBLIC_API_URL`
- a biblioteca visual principal do frontend é a `UI GovPE`
- a documentação operacional do projeto está centralizada neste arquivo

</details>
