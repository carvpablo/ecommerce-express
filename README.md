# E-Shop — Back-end API (`ecommerce-express`)

API RESTful do e-commerce **E-Shop.**, desenvolvida em **Node.js**, **Express 5**, **TypeScript**, **Prisma ORM** (PostgreSQL) e **Stripe Checkout + Webhooks**.

---

## Tecnologias Principais

- **Runtime & Framework:** Node.js + Express 5 (ES Modules)
- **Linguagem:** TypeScript
- **Banco de Dados & ORM:** PostgreSQL + Prisma ORM (`@prisma/client`)
- **Autenticação & Segurança:** JWT (`jsonwebtoken`) em Cookie `HttpOnly` (`jwtToken`), hash de senhas com `bcryptjs` e CORS configurável
- **Pagamentos:** Stripe SDK (`stripe.checkout.sessions` + verificação criptográfica de webhook via `express.raw` e `stripe.parseEventNotification`)

---

## Arquitetura e Fluxo de Compra

1. **Autenticação (`/auth`):**
   - Ao cadastrar (`POST /auth/signin`), o usuário é criado junto com um `Cart` exclusivo no banco e autenticado via cookie `jwtToken` (`HttpOnly`, `sameSite: "none"` e `secure: true` em produção; `sameSite: "lax"` em desenvolvimento).
2. **Catálogo (`/products`):**
   - Listagem e consulta de produtos com estoque real e categoria (`ProductType`: `PERIFÉRICO`, `MONITOR`, `MOUSEPAD`, `CADEIRA`, `ACESSÓRIO`).
3. **Carrinho (`/cart`):**
   - Adição, atualização de quantidade e remoção de itens (`CartItem`) vinculados ao usuário autenticado.
4. **Checkout & Webhook (`/checkout` e `/webhook`):**
   - `POST /checkout` cria uma sessão do **Stripe Checkout** com os itens do carrinho do usuário e envia `metadata: { userId }`.
   - `POST /webhook` recebe a notificação assinada da Stripe (`express.raw({ type: "application/json" })`), valida a assinatura `stripe-signature` e, no evento `v1.checkout.session.completed`, executa a transação `createOrderForUser(userId)` no Prisma:
     - Valida estoque;
     - Cria o registro em `Order` e `OrderItem`;
     - Decrementa o `stock` de cada `Product`;
     - Limpa os itens do carrinho (`CartItem`).

---

## Estrutura de Pastas

```text
ecommerce-express/
├── controllers/          # Lógica das rotas (auth, cart, checkout, order, products, user)
├── middlewares/          # Middleware de validação do token JWT (validateToken)
├── prisma/
│   ├── schema.prisma     # Modelos User, Product, Cart, CartItem, Order, OrderItem
│   └── seed.js           # Seed inicial com 8 produtos de periféricos/setup
├── routes/               # Definição das rotas Express
├── types/                # Extensões de tipos do Express (req.user)
├── util/                 # Utilitários (createOrderForUser com $transaction, generateToken)
├── API_DOCUMENTATION.md  # Documentação detalhada de todos os endpoints e payloads
├── app.ts                # Ponto de entrada e configuração de middlewares/rotas
└── db.ts                 # Instância compartilhada do PrismaClient
```

---

## Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz de `ecommerce-express`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/ecommerce?schema=public"
JWT_SECRET="sua_chave_secreta_jwt"
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Chaves da Stripe (modo teste / sandbox)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Como Rodar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Gere o Prisma Client e aplique as migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **(Opcional) Popule o banco com os 8 produtos iniciais:**
   ```bash
   npx prisma db seed
   ```

4. **Inicie o servidor em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O servidor ficará disponível em `http://localhost:3000`.

5. **Para testar o webhook da Stripe localmente:**
   ```bash
   stripe login
   stripe listen --all-thin --forward-to localhost:3000/webhook
   ```
   Copie o `whsec_...` exibido no terminal para a variável `STRIPE_WEBHOOK_SECRET` no seu `.env`.

---

## Principais Endpoints

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/signin` | Não | Cadastra usuário, cria carrinho e define cookie `jwtToken` |
| `POST` | `/auth/login` | Não | Autentica usuário e define cookie `jwtToken` |
| `POST` | `/auth/logout` | Não | Remove o cookie `jwtToken` |
| `GET` | `/products` | Não | Lista todos os produtos do catálogo |
| `GET` | `/products/:id` | Não | Retorna detalhes de um produto específico |
| `GET` | `/cart` | Sim | Retorna o carrinho do usuário autenticado |
| `POST` | `/cart` | Sim | Adiciona item ao carrinho |
| `PATCH` | `/cart/:id` | Sim | Atualiza a quantidade de um item no carrinho |
| `DELETE` | `/cart/:id` | Sim | Remove um item do carrinho |
| `POST` | `/checkout` | Sim | Cria sessão de pagamento no Stripe Checkout e retorna a URL |
| `POST` | `/webhook` | Assinatura Stripe | Processa `v1.checkout.session.completed` e cria o pedido |
| `GET` | `/orders` | Sim | Lista os pedidos do usuário autenticado |
| `GET` | `/orders/:id` | Sim | Retorna os detalhes de um pedido específico |

Para exemplos completos de requisição e resposta, consulte [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## Deploy (Render)

- **Build Command:**
  ```bash
  npm install --include=dev && npx prisma generate && npm run build
  ```
- **Start Command:**
  ```bash
  npm run start
  ```
- Configure `NODE_ENV=production`, `FRONTEND_URL` com o domínio da Vercel (sem `/` no final) e `STRIPE_WEBHOOK_SECRET` com o segredo do endpoint público cadastrado no Dashboard da Stripe (`https://seu-servico.onrender.com/webhook`).
