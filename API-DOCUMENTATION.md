# 📚 Library Management API - Documentação Completa

## Versão: 1.0.0 | Última Atualização: Janeiro 2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação JWT](#autenticação-jwt)
3. [Estrutura de Resposta](#estrutura-de-resposta)
4. [Papéis e Permissões](#papéis-e-permissões)
5. [Versionamento de API](#versionamento-de-api)
6. [Endpoints](#endpoints)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Tratamento de Erros](#tratamento-de-erros)
9. [Boas Práticas](#boas-práticas)
10. [Modelos de Dados](#modelos-de-dados)
11. [Rate Limiting](#rate-limiting)
12. [Deployment](#deployment)

---

## 🎯 Visão Geral

A **Library Management API** é uma solução completa para gerenciamento de bibliotecas construída com NestJS 11, TypeScript, PostgreSQL e Prisma ORM.

### ✨ Recursos Principais

- ✅ Autenticação e autorização com JWT
- ✅ Controle de acesso baseado em papéis (RBAC)
- ✅ Gestão completa de livros com upload de imagens
- ✅ Sistema de empréstimos com fluxo de aprovação
- ✅ Validação de dados em tempo real
- ✅ Documentação interativa com Swagger UI
- ✅ Versionamento de API (`/api/v1`)
- ✅ Tratamento robusto de erros
- ✅ CORS habilitado

### 📊 Stack Tecnológico

```
Backend:     NestJS 11, TypeScript
Banco:       PostgreSQL 15+
ORM:         Prisma
Auth:        JWT (Passport.js)
Docs:        Swagger/OpenAPI 3.0
Cloud:       Cloudinary (imagens)
Validação:   class-validator, class-transformer
```

---

## 🔐 Autenticação JWT

### Fluxo de Autenticação

```
┌─────────────────────────────────────────────────┐
│ 1. Usuário submete credenciais                  │
│    POST /api/v1/auth/login                      │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Sistema valida credenciais                   │
│    ✓ Email existe                               │
│    ✓ Senha correta                              │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Gera JWT Token (validade: 24h)               │
│    Header: { alg: "HS256", typ: "JWT" }         │
│    Payload: { userId, email, role, exp, iat }  │
│    Signature: HMAC(header.payload, secret)      │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Retorna token ao cliente                     │
│    { access_token: "eyJhbGc...", user: {...} }  │
└─────────────────────────────────────────────────┘
```

### Usando JWT em Requisições

**Header necessário:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Payload do JWT:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "role": "STUDENT",
  "iat": 1735689600,
  "exp": 1735776000
}
```

### Ciclo de Vida do Token

| Evento | Ação |
|--------|------|
| Geração | Token válido por 24 horas |
| Expiração | Usuário deve fazer login novamente |
| Refresh | Implementar endpoint refresh (recomendado) |
| Revogação | Token permanece válido até expirar |

---

## 📦 Estrutura de Resposta

### Resposta de Sucesso

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Operação realizada com sucesso",
  "timestamp": "2025-01-01T10:30:45.123Z"
}
```

### Resposta de Erro

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "email must be an email",
    "password must be longer than or equal to 5 characters"
  ],
  "timestamp": "2025-01-01T10:30:45.123Z"
}
```

### Códigos de Status HTTP

| Código | Descrição | Quando Usar |
|--------|-----------|------------|
| 200 | OK | GET, PATCH, DELETE bem-sucedidos |
| 201 | Created | POST bem-sucedido |
| 204 | No Content | DELETE bem-sucedido (sem body) |
| 400 | Bad Request | Dados inválidos ou validação falhou |
| 401 | Unauthorized | Token ausente, inválido ou expirado |
| 403 | Forbidden | Usuário autenticado mas sem permissão |
| 404 | Not Found | Recurso não existe |
| 409 | Conflict | Recurso duplicado (ex: email já existe) |
| 500 | Server Error | Erro interno do servidor |

---

## 👥 Papéis e Permissões

### Matriz de Acesso

| Endpoint | ADMIN | LIBRARIAN | STUDENT |
|----------|:-----:|:---------:|:-------:|
| POST /auth/register | ✓ | ✓ | ✓ |
| POST /auth/login | ✓ | ✓ | ✓ |
| GET /auth/profile | ✓ | ✓ | ✓ |
| GET /users/:id | ✓ | ✗ | ✗ |
| PATCH /users/:id | ✓ | ✗ | ✗ |
| DELETE /users/:id | ✓ | ✗ | ✗ |
| POST /books | ✓ | ✓ | ✗ |
| GET /books | ✓ | ✓ | ✓ |
| GET /books/:id | ✓ | ✓ | ✓ |
| PATCH /books/:id | ✓ | ✓ | ✗ |
| DELETE /books/:id | ✓ | ✗ | ✗ |
| POST /loans/request | ✗ | ✗ | ✓ |
| GET /loans | ✓ | ✓ | ✗ |
| GET /loans/my-loans | ✗ | ✗ | ✓ |
| PATCH /loans/:id/approve | ✓ | ✓ | ✗ |
| PATCH /loans/:id/reject | ✓ | ✓ | ✗ |
| PATCH /loans/:id/return | ✓ | ✓ | ✗ |

### Descrição dos Papéis

#### 🔴 ADMIN
Administrador completo do sistema com acesso a todas as funcionalidades.
```typescript
Permissões:
- Gerenciar usuários (CRUD)
- Gerenciar livros (CRUD)
- Gerenciar empréstimos (CRUD + aprovações)
- Visualizar relatórios
- Configurar sistema
```

#### 🟡 LIBRARIAN
Bibliotecário responsável pelo gerenciamento de acervo e empréstimos.
```typescript
Permissões:
- Criar e atualizar livros
- Visualizar livros
- Aprovar/rejeitar empréstimos
- Registrar devoluções
- NÃO pode: Deletar livros, gerenciar usuários
```

#### 🟢 STUDENT
Aluno que pode consultar livros e solicitar empréstimos.
```typescript
Permissões:
- Visualizar catálogo de livros
- Solicitar empréstimos
- Visualizar meus empréstimos
- Registrar devoluções de seus empréstimos
- NÃO pode: Criar/editar livros, aprovar empréstimos
```

---

## 📌 Versionamento de API

### Estratégia de Versionamento

A API utiliza **URL path versioning** para manter compatibilidade com clientes antigos.

```
URL Base de Produção: https://api.biblioteca.com/api/v1
URL Base de Desenvolvimento: http://localhost:3000/api/v1
```

### Estrutura de URLs

```
/api/v1/auth/register      → Autenticação
/api/v1/users/:id          → Usuários
/api/v1/books              → Livros
/api/v1/loans              → Empréstimos
```

### Plano de Versionamento Futuro

```
v1 → Lançamento inicial (2025-01-01)
v2 → Refactor de arquitetura (Q3 2025)
v3 → GraphQL support (Q4 2025)
```

### Migração para Nova Versão

```
Fase 1: Lançar v2 em paralelo
Fase 2: Manter v1 por 6 meses
Fase 3: Descontinuar v1, avisar clientes
Fase 4: Remover v1 após 12 meses
```

---

## 🔗 Endpoints

### 🔐 Auth Module

#### 1. Registrar Novo Usuário

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "senha123",
  "role": "STUDENT"
}
```

**Response 201:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 400:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 5 characters"
  ]
}
```

---

#### 2. Fazer Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Response 401:**
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas"
}
```

---

#### 3. Obter Perfil (Autenticado)

```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "iat": 1735689600,
  "exp": 1735776000
}
```

---

### 📖 Books Module

#### 1. Criar Novo Livro (ADMIN, LIBRARIAN)

```http
POST /api/v1/books
Authorization: Bearer <token>
Content-Type: multipart/form-data

title=Clean Code
author=Robert C. Martin
isbn=9780132350884
quantity=10
available=8
image=<binary>
```

**Response 201:**
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "quantity": 10,
  "available": 8,
  "imageUrl": "https://cdn.cloudinary.com/books/clean-code.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### 2. Listar Todos os Livros

```http
GET /api/v1/books?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de registros (padrão: 10)

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884",
      "quantity": 10,
      "available": 8,
      "imageUrl": "https://cdn.cloudinary.com/books/clean-code.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

#### 3. Obter Livro por ID

```http
GET /api/v1/books/1
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "quantity": 10,
  "available": 8,
  "imageUrl": "https://cdn.cloudinary.com/books/clean-code.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "Livro com ID 999 não encontrado"
}
```

---

#### 4. Atualizar Livro (ADMIN, LIBRARIAN)

```http
PATCH /api/v1/books/1
Authorization: Bearer <token>
Content-Type: multipart/form-data

title=Clean Code - 2nd Edition
quantity=15
available=12
image=<binary>
```

**Response 200:**
```json
{
  "id": 1,
  "title": "Clean Code - 2nd Edition",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "quantity": 15,
  "available": 12,
  "imageUrl": "https://cdn.cloudinary.com/books/clean-code-2nd.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### 5. Deletar Livro (ADMIN)

```http
DELETE /api/v1/books/1
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Livro deletado com sucesso",
  "id": 1
}
```

---

### 👤 Users Module

#### 1. Obter Usuário por ID (ADMIN)

```http
GET /api/v1/users/1
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### 2. Atualizar Papel do Usuário (ADMIN)

```http
PATCH /api/v1/users/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "LIBRARIAN"
}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "LIBRARIAN",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### 3. Deletar Usuário (ADMIN)

```http
DELETE /api/v1/users/1
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Usuário deletado com sucesso",
  "id": 1
}
```

---

### 📅 Loans Module

#### 1. Solicitar Empréstimo (STUDENT)

```http
POST /api/v1/loans/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": 1
}
```

**Response 201:**
```json
{
  "id": 1,
  "userId": 5,
  "bookId": 1,
  "loanDate": "2025-01-01T00:00:00.000Z",
  "returnDate": "2025-01-15T00:00:00.000Z",
  "status": "PENDING"
}
```

**Response 400:**
```json
{
  "statusCode": 400,
  "message": "Livro não possui cópias disponíveis"
}
```

---

#### 2. Listar Todos os Empréstimos (ADMIN, LIBRARIAN)

```http
GET /api/v1/loans
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "userId": 5,
      "bookId": 1,
      "loanDate": "2025-01-01T00:00:00.000Z",
      "returnDate": "2025-01-15T00:00:00.000Z",
      "status": "APPROVED",
      "user": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "book": {
        "id": 1,
        "title": "Clean Code",
        "author": "Robert C. Martin"
      }
    }
  ],
  "total": 1
}
```

---

#### 3. Meus Empréstimos (STUDENT)

```http
GET /api/v1/loans/my-loans
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "userId": 5,
      "bookId": 1,
      "loanDate": "2025-01-01T00:00:00.000Z",
      "returnDate": "2025-01-15T00:00:00.000Z",
      "status": "APPROVED"
    }
  ]
}
```

---

#### 4. Aprovar Empréstimo (ADMIN, LIBRARIAN)

```http
PATCH /api/v1/loans/1/approve
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": 1,
  "userId": 5,
  "bookId": 1,
  "loanDate": "2025-01-01T00:00:00.000Z",
  "returnDate": "2025-01-15T00:00:00.000Z",
  "status": "APPROVED"
}
```

---

#### 5. Rejeitar Empréstimo (ADMIN, LIBRARIAN)

```http
PATCH /api/v1/loans/1/reject
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": 1,
  "userId": 5,
  "bookId": 1,
  "loanDate": "2025-01-01T00:00:00.000Z",
  "returnDate": null,
  "status": "REJECTED"
}
```

---

#### 6. Registrar Devolução (ADMIN, LIBRARIAN)

```http
PATCH /api/v1/loans/1/return
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": 1,
  "userId": 5,
  "bookId": 1,
  "loanDate": "2025-01-01T00:00:00.000Z",
  "returnDate": "2025-01-15T00:00:00.000Z",
  "returnedAt": "2025-01-10T12:30:00.000Z",
  "status": "RETURNED"
}
```

---

## 💻 Exemplos de Uso

### JavaScript (fetch)

```javascript
// 1. Registro
const register = async () => {
  const response = await fetch('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'senha123',
      role: 'STUDENT'
    })
  });
  return await response.json();
};

// 2. Login
const login = async () => {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'senha123'
    })
  });
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data;
};

// 3. Requisição autenticada
const getBooks = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:3000/api/v1/books', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// 4. Solicitar empréstimo
const requestLoan = async (bookId) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:3000/api/v1/loans/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ bookId })
  });
  return await response.json();
};
```

### TypeScript (axios)

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces
interface LoginResponse {
  access_token: string;
  user: UserDto;
}

interface UserDto {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'STUDENT';
  createdAt: Date;
}

interface BookDto {
  id: number;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  available: number;
  imageUrl?: string;
  createdAt: Date;
}

// Serviços
class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      email,
      password
    });
    localStorage.setItem('access_token', data.access_token);
    return data;
  }

  static async register(
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<UserDto> {
    const { data } = await api.post<UserDto>('/auth/register', {
      name,
      email,
      password,
      role
    });
    return data;
  }

  static async getProfile(): Promise<UserDto> {
    const { data } = await api.get<UserDto>('/auth/profile');
    return data;
  }
}

class BooksService {
  static async getBooks(page = 1, limit = 10): Promise<BookDto[]> {
    const { data } = await api.get<BookDto[]>('/books', {
      params: { page, limit }
    });
    return data;
  }

  static async getBook(id: number): Promise<BookDto> {
    const { data } = await api.get<BookDto>(`/books/${id}`);
    return data;
  }

  static async createBook(formData: FormData): Promise<BookDto> {
    const { data } = await api.post<BookDto>('/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }

  static async updateBook(id: number, formData: FormData): Promise<BookDto> {
    const { data } = await api.patch<BookDto>(`/books/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }

  static async deleteBook(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/books/${id}`);
    return data;
  }
}

// Uso
(async () => {
  try {
    // Login
    const loginResponse = await AuthService.login(
      'john@example.com',
      'senha123'
    );
    console.log('Usuário logado:', loginResponse.user);

    // Obter livros
    const books = await BooksService.getBooks();
    console.log('Livros:', books);

    // Obter perfil
    const profile = await AuthService.getProfile();
    console.log('Meu perfil:', profile);
  } catch (error) {
    console.error('Erro:', error);
  }
})();
```

### cURL

```bash
# 1. Registro
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "senha123",
    "role": "STUDENT"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "senha123"
  }'

# 3. Listar livros (com token)
curl -X GET http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer <seu_token_aqui>"

# 4. Solicitar empréstimo
curl -X POST http://localhost:3000/api/v1/loans/request \
  -H "Authorization: Bearer <seu_token_aqui>" \
  -H "Content-Type: application/json" \
  -d '{"bookId": 1}'

# 5. Criar livro com imagem
curl -X POST http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer <seu_token_aqui>" \
  -F "title=Clean Code" \
  -F "author=Robert C. Martin" \
  -F "isbn=9780132350884" \
  -F "quantity=10" \
  -F "available=8" \
  -F "image=@/path/to/image.jpg"
```

---

## ⚠️ Tratamento de Erros

### Erros Comuns

#### 400 - Bad Request
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "email must be an email",
    "password must be longer than or equal to 5 characters",
    "quantity must not be less than 1"
  ],
  "timestamp": "2025-01-01T10:30:45.123Z"
}
```

**Causas Comuns:**
- Dados de entrada inválidos
- Falta de campos obrigatórios
- Tipos de dados incorretos

**Solução:**
- Valide dados no cliente antes de enviar
- Verifique a documentação dos campos
- Use o Swagger UI para testar

---

#### 401 - Unauthorized
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Token inválido ou expirado",
  "timestamp": "2025-01-01T10:30:45.123Z"
}
```

**Causas Comuns:**
- Token não fornecido
- Token expirado
- Token inválido ou corrompido

**Solução:**
- Adicione o header: `Authorization: Bearer <token>`
- Faça login novamente para obter novo token
- Implemente refresh token (se disponível)

---

#### 403 - Forbidden
```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Você não tem permissão para acessar este recurso",
  "timestamp": "2025-01-01T10:30:45.123Z"
}
```

**Causas Comuns:**
- Seu papel não tem permissão
- Tentando acessar recurso de outro usuário

**Solução:**
- Solicite ao admin para elevar seu papel
- Verifique se está usando o usuário correto

---

#### 404 - Not Found
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Livro com ID 999 não encontrado",
  "timestamp": "2025-01-01T10:30:45.123Z"
}
```

**Causas Comuns:**
- ID do recurso não existe
- Recurso foi deletado

**Solução:**
- Verifique o ID do recurso
- Liste todos os recursos para encontrar o correto

---

#### 500 - Internal Server Error
```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Erro ao processar sua requisição",
  "timestamp": "2025-01-01T10:30:45.123Z"
}
```

**Causas Comuns:**
- Bug no servidor
- Banco de dados desconectado
- Erro de configuração

**Solução:**
- Contate o suporte
- Verifique os logs do servidor
- Tente novamente mais tarde

---

## 🎯 Boas Práticas

### 1. Autenticação

✅ **Fazer:**
```typescript
// Usar JWT para requisições de longa duração
const token = localStorage.getItem('access_token');
const response = await fetch('/api/v1/books', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Renovar token antes de expirar
setInterval(refreshToken, 23 * 60 * 60 * 1000); // A cada 23h

// Guardar token seguro
sessionStorage.setItem('access_token', token); // Melhor que localStorage
```

❌ **Evitar:**
```typescript
// Não armazenar senhas
localStorage.setItem('password', password);

// Não expor token na URL
window.location.href = `/api/v1/books?token=${token}`;

// Não usar token expirado
fetch('/api/v1/books', {
  headers: { 'Authorization': `Bearer ${expiredToken}` }
});
```

---

### 2. Requisições

✅ **Fazer:**
```typescript
// Usar try-catch
try {
  const response = await fetch('/api/v1/books/1');
  const data = await response.json();
} catch (error) {
  console.error('Erro:', error);
}

// Validar resposta
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

// Adicionar timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);
await fetch('/api/v1/books', { signal: controller.signal });
clearTimeout(timeoutId);
```

❌ **Evitar:**
```typescript
// Não ignorar erros
fetch('/api/v1/books/1').then(r => r.json());

// Não fazer requisições sequenciais desnecessárias
const books = await fetch('/api/v1/books');
const users = await fetch('/api/v1/users'); // Fazer em paralelo!

// Requisições sem tratamento de erro
fetch('/api/v1/books').then(r => r.json()).then(data => console.log(data));
```

---

### 3. Upload de Arquivos

✅ **Fazer:**
```typescript
// Validar antes de enviar
if (file.size > 5 * 1024 * 1024) {
  alert('Arquivo muito grande (máx 5MB)');
  return;
}

const allowed = ['image/jpeg', 'image/png'];
if (!allowed.includes(file.type)) {
  alert('Tipo de arquivo não permitido');
  return;
}

// Usar FormData para arquivos
const formData = new FormData();
formData.append('image', file);
formData.append('title', 'Clean Code');
await fetch('/api/v1/books', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

❌ **Evitar:**
```typescript
// Não enviar arquivo sem validação
const formData = new FormData();
formData.append('image', file);

// Não usar JSON para arquivo
JSON.stringify({ image: file }); // Não funciona!
```

---

### 4. Rate Limiting

✅ **Fazer:**
```typescript
// Implementar debounce
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const searchBooks = debounce(async (query) => {
  const response = await fetch(`/api/v1/books?search=${query}`);
  return await response.json();
}, 300);

// Limitar requisições simultâneas
const requestQueue = [];
const limit = 5;
```

---

### 5. Versionamento

✅ **Fazer:**
```typescript
// Sempre usar versão na URL
const API_BASE = 'https://api.biblioteca.com/api/v1';

// Preparar para migração de versão
const API_BASE = process.env.REACT_APP_API_VERSION === 'v2'
  ? 'https://api.biblioteca.com/api/v2'
  : 'https://api.biblioteca.com/api/v1';
```

---

## 📊 Modelos de Dados

### User
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$...", // bcrypt hash
  "role": "STUDENT",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Book
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "quantity": 10,
  "available": 8,
  "imageUrl": "https://cdn.cloudinary.com/books/clean-code.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Loan
```json
{
  "id": 1,
  "userId": 5,
  "bookId": 1,
  "loanDate": "2025-01-01T00:00:00.000Z",
  "returnDate": "2025-01-15T00:00:00.000Z",
  "returnedAt": null,
  "status": "APPROVED"
}
```

---

## ⏱️ Rate Limiting

A API implementa rate limiting para proteger contra abuso:

| Limite | Descrição |
|--------|-----------|
| 100 req/min | Por IP (geral) |
| 10 req/min | Por IP (login) |
| 50 req/min | Por Token (autenticado) |

**Header de resposta com limite:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 89
X-RateLimit-Reset: 1735776000
```

---

## 🚀 Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

```bash
# Build
docker build -t library-api:1.0.0 .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/library" \
  -e JWT_SECRET="your-secret-key" \
  library-api:1.0.0
```

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/library
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: library
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/library

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=24h

# Server
NODE_ENV=production
PORT=3000

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGIN=https://seu-frontend.com
```

---

## 📚 Recursos Adicionais

- 📖 [Documentação NestJS](https://docs.nestjs.com)
- 🔐 [JWT.io](https://jwt.io)
- 📘 [Swagger/OpenAPI](https://swagger.io)
- 🗄️ [Prisma ORM](https://www.prisma.io)
- 🚀 [Rest Best Practices](https://restfulapi.net)

---

## 📞 Suporte

- **Email:** support@biblioteca.com
- **Issues:** https://github.com/seu-repo/library-api/issues
- **Documentação Swagger:** http://localhost:3000/api

---

## 📄 Licença

MIT License © 2025 Library Management API

---

**Última atualização:** Janeiro 2025
**Versão:** 1.0.0
**Status:** Production-Ready ✅
