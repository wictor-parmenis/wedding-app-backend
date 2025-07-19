# Changelog - 2025-07-19

## Permissões de Admin vs Usuário

### Admin (`/admin/gifts`)
- Pode criar presentes
- Pode listar todos os presentes
- Pode deletar qualquer presente
- Pode atualizar qualquer presente
- Pode reservar presentes para qualquer usuário (informando o user_id)
- Pode cancelar reserva de qualquer presente para qualquer usuário (informando o user_id)
- Pode cancelar compra de qualquer presente para qualquer usuário (informando o user_id)
- Pode fazer upload de comprovante de pagamento para qualquer presente
- Pode confirmar compra direta para qualquer usuário (informando o user_id)
- Pode ver detalhes de qualquer presente
- Todas as rotas são protegidas por autenticação e exigem permissão de admin
Obs: o user_id das rotas que precisam dessa informação será passada pelo body.

### Usuário (`/gifts`)
- Pode listar presentes
- Pode reservar presente para si mesmo
- Pode cancelar sua própria reserva
- Pode cancelar sua própria compra
- Pode fazer upload de comprovante de pagamento para presentes reservados/comprados por ele
- Pode confirmar compra direta para si mesmo
- Pode ver detalhes de qualquer presente
- Todas as rotas são protegidas por autenticação

---

**Observação:**
- O admin pode agir em nome de qualquer usuário, enquanto o usuário comum só pode agir em seu próprio nome.
- O controle de permissão é feito via guards (`FirebaseAuthGuard` e `AdminGuard`).
