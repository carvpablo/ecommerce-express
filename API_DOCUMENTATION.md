# 📚 Documentação da API - E-commerce Express

API REST desenvolvida em **Node.js**, **Express**, **TypeScript** e **Prisma ORM** (PostgreSQL).

---

## 🌐 Informações Gerais

- **Base URL:** `http://localhost:3000` (ou porta configurada na variável `PORT`)
- **Formato das Requisições/Respostas:** `application/json`
- **Autenticação:** Baseada em JSON Web Token (JWT).
  - Pode ser enviado automaticamente via **Cookie HttpOnly** (`jwtToken`), gerado no login.
  - Ou enviado no Header HTTP:
    ```http
    Authorization: Bearer <seu_token_jwt>
    ```

---

## 🔒 Regras de Autenticação

| Grupo de Rotas | Protegido por Token? | Descrição |
| :--- | :---: | :--- |
| `/auth/*` | ❌ Não | Registro, login e logout público |
| `/products` (GET) | ❌ Não | Listagem pública de produtos |
| `/products` (POST, PATCH, DELETE) | ❌ Não* | Gerenciamento de produtos (*aberto no momento) |
| `/cart/*` | 🔐 **Sim** | Operações de carrinho do usuário logado |
| `/users/*` | 🔐 **Sim** | Consulta, atualização e remoção de dados do usuário |
| `/orders/*` | 🔐 **Sim** | Criação e cancelamento de pedidos |

---

## 1. Autenticação (`/auth`)

### 1.1 Registrar Usuário
Cria uma nova conta e inicializa um carrinho vazio vinculado ao usuário.

- **Método:** `POST`
- **Endpoint:** `/auth/signin`
- **Autenticação:** Nenhuma
- **Request Body:**
  ```json
  {
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senhaSegura123"
  }
  ```
- **Respostas:**
  - `201 Created`
    ```json
    {
      "message": "User created successfully"
    }
    ```
  - `500 Internal Server Error`
    ```json
    {
      "error": "Error creating user"
    }
    ```

---

### 1.2 Fazer Login
Autentica o usuário, gera o JWT e define o cookie seguro `jwtToken`.

- **Método:** `POST`
- **Endpoint:** `/auth/login`
- **Autenticação:** Nenhuma
- **Request Body:**
  ```json
  {
    "email": "joao@email.com",
    "password": "senhaSegura123"
  }
  ```
- **Respostas:**
  - `200 OK` (Define o cookie `jwtToken` com validade de 7 dias)
    ```json
    {
      "message": "User logged successfully"
    }
    ```
  - `401 Unauthorized`
    ```json
    {
      "error": "Invalid email or password"
    }
    ```
  - `500 Internal Server Error`
    ```json
    {
      "error": "Error logging in"
    }
    ```

---

### 1.3 Fazer Logout
Limpa o cookie de sessão `jwtToken`.

- **Método:** `POST`
- **Endpoint:** `/auth/logout`
- **Autenticação:** Nenhuma
- **Respostas:**
  - `200 OK`
    ```json
    {
      "message": "Logout successful"
    }
    ```
  - `500 Internal Server Error`
    ```json
    {
      "error": "Failed to log out"
    }
    ```

---

## 2. Produtos (`/products`)

### 2.1 Listar Produtos
Retorna todos os produtos cadastrados no banco de dados.

- **Método:** `GET`
- **Endpoint:** `/products`
- **Autenticação:** Nenhuma
- **Respostas:**
  - `200 OK`
    ```json
    {
      "products": [
        {
          "id": "c1f7b8e1-5f21-4f81-a6ec-c25e4c63bf72",
          "name": "Teclado Mecânico RGB",
          "price": 250,
          "description": "Switch azul, layout ABNT2",
          "stock": 15
        }
      ]
    }
    ```

---

### 2.2 Cadastrar Produto
- **Método:** `POST`
- **Endpoint:** `/products`
- **Autenticação:** Nenhuma
- **Request Body:**
  ```json
  {
    "name": "Mouse Gamer",
    "price": 120,
    "description": "Sensor óptico 16000 DPI",
    "stock": 30
  }
  ```
- **Respostas:**
  - `201 Created`
    ```json
    {
      "success": "Product created",
      "data": {
        "id": "e2a4f48d-b3b4-4b53-90d5-1f9db8e85aa1",
        "name": "Mouse Gamer",
        "price": 120,
        "description": "Sensor óptico 16000 DPI",
        "stock": 30
      }
    }
    ```
  - `400 Bad Request`
    ```json
    {
      "error": "Insert valid data"
    }
    ```

---

### 2.3 Atualizar Produto
- **Método:** `PATCH`
- **Endpoint:** `/products/:id`
- **Parâmetros de URL:** `id` (UUID do produto)
- **Request Body:**
  ```json
  {
    "name": "Mouse Gamer Pro",
    "price": 140,
    "description": "Sensor óptico atualizado",
    "stock": 25
  }
  ```
- **Respostas:**
  - `200 OK`
    ```json
    {
      "success": "Product updated",
      "data": {
        "id": "e2a4f48d-b3b4-4b53-90d5-1f9db8e85aa1",
        "name": "Mouse Gamer Pro",
        "price": 140,
        "description": "Sensor óptico atualizado",
        "stock": 25
      }
    }
    ```
  - `404 Not Found`
    ```json
    {
      "error": "Product not found"
    }
    ```

---

### 2.4 Deletar Produto
- **Método:** `DELETE`
- **Endpoint:** `/products/:id`
- **Parâmetros de URL:** `id` (UUID do produto)
- **Respostas:**
  - `200 OK`
    ```json
    {
      "success": "Product deleted successfully"
    }
    ```
  - `404 Not Found`
    ```json
    {
      "error": "Product id not found"
    }
    ```

---

## 3. Carrinho (`/cart`)

> 🔐 **Todas as rotas exigem autenticação.**

### 3.1 Obter Carrinho do Usuário
Recupera os itens do carrinho associados ao usuário logado.

- **Método:** `GET`
- **Endpoint:** `/cart`
- **Respostas:**
  - `200 OK`
    ```json
    {
      "cart": {
        "id": "7b7e80a0-07bf-4be3-85f2-95f0c43ca3f0",
        "userId": "c0e6601f-6a68-45a8-baec-2458a2d12e61",
        "createdAt": "2026-10-08T10:00:00.000Z",
        "updatedAt": "2026-10-08T10:05:00.000Z",
        "products": [
          {
            "id": "item-uuid-123",
            "cartId": "7b7e80a0-07bf-4be3-85f2-95f0c43ca3f0",
            "productId": "c1f7b8e1-5f21-4f81-a6ec-c25e4c63bf72",
            "quantity": 2,
            "product": {
              "id": "c1f7b8e1-5f21-4f81-a6ec-c25e4c63bf72",
              "name": "Teclado Mecânico RGB",
              "price": 250,
              "description": "Switch azul",
              "stock": 15
            }
          }
        ]
      }
    }
    ```

---

### 3.2 Adicionar / Incrementar Item no Carrinho
Adiciona um produto ao carrinho ou incrementa a quantidade caso o item já exista (`upsert`).

- **Método:** `POST`
- **Endpoint:** `/cart`
- **Request Body:**
  ```json
  {
    "cartId": "7b7e80a0-07bf-4be3-85f2-95f0c43ca3f0",
    "productId": "c1f7b8e1-5f21-4f81-a6ec-c25e4c63bf72",
    "quantity": 1
  }
  ```
- **Respostas:**
  - `200 OK`
    ```json
    {
      "message": "Cart updated successfully",
      "data": {
        "id": "item-uuid-123",
        "cartId": "7b7e80a0-07bf-4be3-85f2-95f0c43ca3f0",
        "productId": "c1f7b8e1-5f21-4f81-a6ec-c25e4c63bf72",
        "quantity": 2,
        "product": { ... }
      }
    }
    ```
  - `400 Bad Request`
    ```json
    {
      "error": "cartId and productId are required"
    }
    ```

---

### 3.3 Remover Item do Carrinho
Remove um item específico (`CartItem`) pelo seu ID.

- **Método:** `DELETE`
- **Endpoint:** `/cart/:id`
- **Parâmetros de URL:** `id` (UUID do item `CartItem`)
- **Respostas:**
  - `200 OK`
    ```json
    {
      "message": "Item deleted from cart"
    }
    ```

---

## 4. Pedidos (`/orders`)

> 🔐 **Todas as rotas exigem autenticação.**

### 4.1 Criar Pedido (Checkout)
Gera um pedido a partir de todos os itens atualmente no carrinho do usuário autenticado:
1. Valida se o estoque é suficiente para cada produto.
2. Calcula o valor total do pedido.
3. Cria a ordem e itens da ordem (`OrderItem`).
4. Decrementa o estoque dos produtos comprados.
5. Limpa os itens do carrinho.

- **Método:** `POST`
- **Endpoint:** `/orders`
- **Request Body:** Opcionalmente `{ "userId": "..." }`, caso contrário usa o ID do usuário do token JWT.
- **Respostas:**
  - `201 Created`
    ```json
    {
      "message": "Order created successfully",
      "order": {
        "id": "e4d7a8d5-1234-5678-90ab-cdef12345678",
        "orderNumber": 1,
        "total": 500,
        "userId": "c0e6601f-6a68-45a8-baec-2458a2d12e61",
        "createdAt": "2026-10-08T10:10:00.000Z",
        "items": [
          {
            "id": "order-item-uuid",
            "orderId": "e4d7a8d5-1234-5678-90ab-cdef12345678",
            "productId": "c1f7b8e1-5f21-4f81-a6ec-c25e4c63bf72",
            "quantity": 2,
            "price": 250
          }
        ]
      }
    }
    ```
  - `400 Bad Request` (Carrinho vazio ou estoque insuficiente)
    ```json
    {
      "error": "Your cart is empty"
    }
    ```
    *ou:*
    ```json
    {
      "error": "Insufficient stock for product \"Teclado Mecânico RGB\". Available: 1, requested: 2"
    }
    ```

---

### 4.2 Deletar / Cancelar Pedido
Cancela um pedido existente, devolvendo as quantidades de volta ao estoque dos produtos.

- **Método:** `DELETE`
- **Endpoint:** `/orders/:id`
- **Parâmetros de URL:** `id` (UUID do pedido)
- **Respostas:**
  - `200 OK`
    ```json
    {
      "message": "Order deleted successfully"
    }
    ```
  - `403 Forbidden` (Tentativa de deletar pedido de outro usuário)
    ```json
    {
      "error": "Not authorized to delete this order"
    }
    ```
  - `404 Not Found`
    ```json
    {
      "error": "Order not found"
    }
    ```

---

## 5. Usuários (`/users`)

> 🔐 **Todas as rotas exigem autenticação.**

### 5.1 Buscar Usuário por ID
- **Método:** `GET`
- **Endpoint:** `/users/:id`
- **Parâmetros de URL:** `id` (UUID do usuário)
- **Respostas:**
  - `200 OK`
    ```json
    {
      "user": {
        "id": "c0e6601f-6a68-45a8-baec-2458a2d12e61",
        "name": "João Silva",
        "email": "joao@email.com",
        "createdAt": "2026-10-08T10:00:00.000Z"
      }
    }
    ```
  - `404 Not Found`
    ```json
    {
      "error": "User not found"
    }
    ```

---

### 5.2 Atualizar Usuário
- **Método:** `PUT`
- **Endpoint:** `/users`
- **Request Body:**
  ```json
  {
    "email": "joao@email.com",
    "name": "João Silva Atualizado"
  }
  ```
- **Respostas:**
  - `200 OK`
    ```json
    {
      "message": "User updated successfully"
    }
    ```
  - `404 Not Found`
    ```json
    {
      "error": "User not found"
    }
    ```

---

### 5.3 Deletar Usuário
- **Método:** `DELETE`
- **Endpoint:** `/users/:id`
- **Parâmetros de URL:** `id` (UUID do usuário)
- **Respostas:**
  - `200 OK`
    ```json
    {
      "message": "User deleted successfully"
    }
    ```
  - `404 Not Found`
    ```json
    {
      "error": "User not found"
    }
    ```

---

## ⚠️ Códigos de Status HTTP Comuns

| Código | Descrição |
| :--- | :--- |
| `200 OK` | Requisição processada com sucesso. |
| `201 Created` | Recurso criado com sucesso. |
| `400 Bad Request` | Parâmetros ou corpo da requisição inválidos. |
| `401 Unauthorized` | Token JWT ausente ou inválido. |
| `403 Forbidden` | Usuário não tem permissão para a ação no recurso. |
| `404 Not Found` | Recurso não encontrado no banco de dados. |
| `500 Internal Error` | Erro não tratado no servidor. |

