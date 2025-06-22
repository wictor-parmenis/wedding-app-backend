# Wedding Gift List API

Backend API for managing wedding gift lists, using NestJS, PostgreSQL, Firebase Auth, and AWS S3.

## 🚀 Development Setup

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn
- PostgreSQL client (optional, for direct database access)

### 🛠️ Development Environment Setup

You can run this project in two ways:
1. Everything in Docker (API + Database)
2. Database in Docker + API locally (recommended for development)

#### Running Database in Docker + API Locally (Recommended)

1. Start the PostgreSQL database:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. Install dependencies:
```bash
npm install
```

3. Apply database migrations:
```bash
npx prisma migrate deploy
```

4. Seed the database:
```bash
npm run seed
```

5. Start the API in development mode:
```bash
npm run start:dev
```

The API will be available at http://localhost:3000 with hot-reload enabled.

#### Running Everything in Docker

If you prefer to run both the API and database in Docker:

```bash
docker-compose up -d
```

### 📝 Environment Variables

Make sure to set up your `.env` file with the following variables:

```env
# When running API locally
DATABASE_URL="postgresql://admin:password@localhost:5432/wedding_database"

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL="your-firebase-email"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"

# AWS S3 (for file uploads)
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 🛑 Stopping the Services

To stop the database when running locally:
```bash
docker-compose -f docker-compose.dev.yml down
```

To stop both API and database when running full Docker setup:
```bash
docker-compose down
```

### 📊 Database Management

View database logs:
```bash
docker logs database-container -f
```

Connect to database (requires PostgreSQL client):
```bash
psql -h localhost -U admin -d wedding_database
```

### 🧪 Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

### 📚 Available Scripts

- `npm run start:dev` - Start the application in development mode
- `npm run build` - Build the application
- `npm run start:prod` - Start the application in production mode
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run seed` - Seed the database
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🏗️ Project Structure

```
src/
├── auth/           # Authentication & authorization
├── file/          # File upload handling
├── firebase/      # Firebase integration
├── gift/          # Gift management
├── gift-payment/  # Payment processing
├── prisma/        # Database configuration
└── user/          # User management
```

## 🔒 Authentication

This project uses Firebase Authentication. Protected routes require a valid Firebase token in the Authorization header:

```
Authorization: Bearer your-firebase-token
```

## 📝 API Documentation

[Add your API documentation here]

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Comandos úteis Nest CLI

### Criar novo módulo

```bash
# Criar um módulo completo (com .module, .service, .controller)
$ nest generate module nome-do-modulo

# Ou forma abreviada
$ nest g mo nome-do-modulo
```

### Criar outros recursos

```bash
# Criar controller
$ nest g controller nome-do-controller

# Criar service
$ nest g service nome-do-service

# Criar guard
$ nest g guard nome-do-guard

# Criar interface
$ nest g interface nome-da-interface

# Criar class
$ nest g class nome-da-class
```

Todos os recursos são criados automaticamente com:

- Arquivos de teste
- Importação no módulo apropriado
- Estrutura de pastas seguindo as convenções do Nest.js

### Fluxo de autenticação

**Frontend (Client SDK)**:

1. Faz a tentativa de login com email/senha usando `signInWithEmailAndPassword`
2. Recebe um ID Token do Firebase se as credenciais estiverem corretas
3. Envia este ID Token para seu backend nas requisições

**Processo de Logoff**:

- Chamar `signOut(auth)` do Firebase Client SDK
- Isso automaticamente:
  - Remove todas as informações de autenticação do usuário localmente
  - Remove o token de acesso da memória
  - Limpa o estado de autenticação do usuário
- Não é necessário notificar o backend, pois o token JWT será invalidado automaticamente

**Backend (Admin SDK/seu código atual)**:

1. Recebe o ID Token que o frontend obteve
2. Verifica se o token é válido usando [verifyIdToken]
3. Gerencia a sessão do usuário
4. Protege as rotas da API
5. Executa lógicas de negócio específicas

### Fluxo de Troca de Senha
**Frontend (Client SDK)**:

1. **Iniciar o processo (Esqueci minha senha)**:
   - Verificar se o email existe fazendo uma requisição para o backend: `POST /v1/auth/check-email`
   - Se o email existir, chamar `sendPasswordResetEmail(auth, email)` do Firebase Auth
   - O usuário receberá um email com um link para resetar a senha

2. **Trocar senha quando logado**:
   - Obter o usuário atual: `const user = auth.currentUser`
   - Atualizar senha: `updatePassword(user, newPassword)`
   - Reautenticar se necessário: `reauthenticateWithCredential(user, credential)`

**Backend (Admin SDK)**:

1. **Resetar senha (administrativamente)**:
   - Usar `admin.auth().updateUser(uid, { password: newPassword })`
   - Retornar sucesso/erro para o frontend

2. **Validar nova senha**:
   - Implementar regras de validação (comprimento mínimo, caracteres especiais, etc.)
   - Retornar mensagens de erro específicas se a validação falhar

### Mensagens de UX que podem ser úteis

#### Modal de confirmação de compra de presente sem envio de comprovante
Iremos notificar aos noivos que esse presente já foi comprado e que podemos retirar ele da lista.

Deseja confirmar ação de confirmação de compra?