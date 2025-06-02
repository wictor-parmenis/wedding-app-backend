## Project setup

```bash
$ npm install
```

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

### Fluxo de autenticação
**Frontend (Client SDK)**:

1. Faz a tentativa de login com email/senha usando `signInWithEmailAndPassword`
2. Recebe um ID Token do Firebase se as credenciais estiverem corretas
3. Envia este ID Token para seu backend nas requisições

**Backend (Admin SDK/seu código atual)**:

1. Recebe o ID Token que o frontend obteve
2. Verifica se o token é válido usando [verifyIdToken]
3. Gerencia a sessão do usuário
4. Protege as rotas da API
5. Executa lógicas de negócio específicas

### Fluxo de Troca de Senha
**Frontend (Client SDK)**:

1. **Iniciar o processo (Esqueci minha senha)**:
   - Verificar se o email existe fazendo uma requisição para o backend: `POST /v1/auth/forgot-password`
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

