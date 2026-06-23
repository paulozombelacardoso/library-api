# 🎨 Swagger/OpenAPI Decorators - Referência Rápida

## Índice

1. [Decorators Principais](#decorators-principais)
2. [Exemplos Práticos](#exemplos-práticos)
3. [Estrutura OpenAPI 3.0](#estrutura-openapi-30)
4. [Configurações Avançadas](#configurações-avançadas)

---

## 📌 Decorators Principais

### @ApiTags

Define a tag (categoria) para agrupar endpoints no Swagger.

```typescript
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // Todos os endpoints deste controller estarão sob a tag 'Auth'
}
```

**Múltiplas tags:**
```typescript
@ApiTags('Auth', 'Security')
@Post('login')
login(@Body() dto: LoginDto) { }
```

---

### @ApiOperation

Descreve a operação com resumo e descrição detalhada.

```typescript
@ApiOperation({
  summary: 'Fazer login',
  description: 'Autentica o usuário com email e senha, retornando um JWT token válido por 24 horas.'
})
@Post('login')
login(@Body() dto: LoginDto) { }
```

**Propriedades:**
- `summary`: Título curto (máx 120 caracteres)
- `description`: Descrição detalhada
- `operationId`: ID único da operação
- `deprecated`: Marcar como descontinuado

---

### @ApiResponse

Define respostas possíveis (status e schema).

```typescript
@ApiResponse({
  status: 200,
  description: 'Login realizado com sucesso',
  schema: {
    example: {
      access_token: 'eyJhbGc...',
      user: { id: 1, name: 'John' }
    }
  }
})
@ApiResponse({
  status: 401,
  description: 'Credenciais inválidas'
})
@Post('login')
login(@Body() dto: LoginDto) { }
```

**Status comuns:**
- `200`: OK
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

### @ApiBearerAuth

Indica que o endpoint requer autenticação Bearer (JWT).

```typescript
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Req() req: any) { }
```

**Configuração em main.ts:**
```typescript
const config = new DocumentBuilder()
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    },
    'jwt-auth'
  )
  .build();
```

---

### @ApiParam

Documenta parâmetros de rota.

```typescript
@ApiParam({
  name: 'id',
  type: Number,
  example: 1,
  description: 'ID único do livro',
  required: true
})
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) { }
```

**Propriedades:**
- `name`: Nome do parâmetro
- `type`: Tipo (String, Number, Boolean)
- `description`: Descrição
- `example`: Valor de exemplo
- `required`: Obrigatório (padrão: true para route params)
- `deprecated`: Descontinuado

---

### @ApiQuery

Documenta parâmetros de query string.

```typescript
@ApiQuery({
  name: 'page',
  type: Number,
  required: false,
  example: 1,
  description: 'Número da página'
})
@ApiQuery({
  name: 'limit',
  type: Number,
  required: false,
  example: 10,
  description: 'Limite de registros por página'
})
@Get()
findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '10'
) { }
```

**Tipos suportados:**
- `String`
- `Number`
- `Boolean`
- `Array`

---

### @ApiBody

Define o schema do corpo da requisição.

```typescript
// Com DTO
@ApiBody({
  type: LoginDto,
  examples: {
    example1: {
      summary: 'Login de exemplo',
      value: {
        email: 'john@example.com',
        password: 'senha123'
      }
    }
  }
})
@Post('login')
login(@Body() dto: LoginDto) { }

// Com schema manual
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', example: 'Clean Code' },
      author: { type: 'string', example: 'Robert C. Martin' }
    },
    required: ['title', 'author']
  }
})
@Post('books')
createBook(@Body() createBookDto: CreateBookDto) { }
```

---

### @ApiProperty

Documenta propriedades de DTOs.

```typescript
export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário',
    type: String,
    example: 'john@example.com',
    format: 'email',
    minLength: 5,
    maxLength: 255
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha (mínimo 5 caracteres)',
    type: String,
    example: 'senha123',
    minLength: 5
  })
  @MinLength(5)
  password: string;

  @ApiProperty({
    description: 'Aceitar termos (opcional)',
    type: Boolean,
    required: false,
    default: false
  })
  @IsOptional()
  acceptTerms?: boolean;
}
```

**Propriedades úteis:**
- `description`: Descrição do campo
- `example`: Valor de exemplo
- `type`: Tipo TypeScript
- `format`: Formato (email, date, etc.)
- `minLength`, `maxLength`: Limites de string
- `minimum`, `maximum`: Limites numéricos
- `default`: Valor padrão
- `required`: Campo obrigatório
- `enum`: Lista de valores válidos
- `isArray`: É um array

---

### @ApiConsumes / @ApiProduces

Define tipos de conteúdo.

```typescript
// Upload de arquivo
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      image: { type: 'string', format: 'binary' }
    }
  }
})
@Post('books')
@UseInterceptors(FileInterceptor('image'))
createBook(
  @Body() dto: CreateBookDto,
  @UploadedFile() file: Express.Multer.File
) { }

// API que retorna XML
@ApiProduces('application/xml')
@Get('export')
exportBooks() { }
```

---

### @ApiExcludeEndpoint

Esconde endpoint do Swagger.

```typescript
@ApiExcludeEndpoint()
@Get('internal')
internalEndpoint() { }
```

---

### @ApiHeaders

Documenta headers customizados.

```typescript
@ApiHeaders([
  {
    name: 'X-Custom-Header',
    description: 'Custom header description',
    required: true,
    example: 'custom-value'
  }
])
@Get('with-header')
withHeader(@Headers('X-Custom-Header') customHeader: string) { }
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Endpoint GET com Paginação

```typescript
@ApiTags('Books')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BooksController {
  @Get()
  @ApiOperation({
    summary: 'Listar livros com paginação',
    description: 'Retorna uma lista paginada de livros do sistema'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número da página'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Quantidade por página'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de livros',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: 'Clean Code',
            author: 'Robert C. Martin',
            isbn: '9780132350884',
            quantity: 10,
            available: 8
          }
        ],
        total: 1,
        page: 1,
        limit: 10
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado'
  })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    return this.booksService.findAll(+page, +limit);
  }
}
```

---

### Exemplo 2: Endpoint POST com Upload

```typescript
@Post('books')
@Roles(Role.ADMIN, Role.LIBRARIAN)
@UseInterceptors(FileInterceptor('image'))
@ApiOperation({
  summary: 'Criar novo livro',
  description: 'Cria um novo livro no sistema com upload de capa'
})
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        example: 'Clean Code',
        description: 'Título do livro'
      },
      author: {
        type: 'string',
        example: 'Robert C. Martin',
        description: 'Autor do livro'
      },
      isbn: {
        type: 'string',
        example: '9780132350884',
        description: 'ISBN do livro'
      },
      quantity: {
        type: 'number',
        example: 10,
        description: 'Quantidade total'
      },
      available: {
        type: 'number',
        example: 8,
        description: 'Quantidade disponível'
      },
      image: {
        type: 'string',
        format: 'binary',
        description: 'Imagem da capa'
      }
    },
    required: ['title', 'author', 'isbn', 'quantity', 'available']
  }
})
@ApiResponse({
  status: 201,
  description: 'Livro criado com sucesso',
  schema: {
    example: {
      id: 1,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      quantity: 10,
      available: 8,
      imageUrl: 'https://cdn.example.com/clean-code.jpg',
      createdAt: '2025-01-01T00:00:00Z'
    }
  }
})
@ApiResponse({
  status: 400,
  description: 'Validação falhou'
})
@ApiResponse({
  status: 403,
  description: 'Sem permissão'
})
createBook(
  @Body() dto: CreateBookDto,
  @UploadedFile() file: Express.Multer.File
) {
  return this.booksService.createBook(dto, file);
}
```

---

### Exemplo 3: Endpoint PATCH com Parâmetro

```typescript
@Patch(':id/approve')
@Roles(Role.ADMIN, Role.LIBRARIAN)
@ApiOperation({
  summary: 'Aprovar empréstimo',
  description: 'Muda o status do empréstimo de PENDING para APPROVED'
})
@ApiParam({
  name: 'id',
  type: Number,
  description: 'ID do empréstimo',
  example: 1
})
@ApiResponse({
  status: 200,
  description: 'Empréstimo aprovado',
  schema: {
    example: {
      id: 1,
      userId: 5,
      bookId: 1,
      status: 'APPROVED',
      loanDate: '2025-01-01T00:00:00Z',
      returnDate: '2025-01-15T00:00:00Z'
    }
  }
})
@ApiResponse({
  status: 404,
  description: 'Empréstimo não encontrado'
})
@ApiResponse({
  status: 409,
  description: 'Empréstimo já foi aprovado'
})
approveLoans(@Param('id', ParseIntPipe) id: number) {
  return this.loansService.approveLoans(id);
}
```

---

### Exemplo 4: Endpoint DELETE

```typescript
@Delete(':id')
@Roles(Role.ADMIN)
@ApiOperation({
  summary: 'Deletar livro',
  description: 'Remove um livro do sistema de forma permanente'
})
@ApiParam({
  name: 'id',
  type: Number,
  description: 'ID do livro',
  example: 1
})
@ApiResponse({
  status: 200,
  description: 'Livro deletado com sucesso',
  schema: {
    example: {
      message: 'Livro deletado com sucesso',
      id: 1
    }
  }
})
@ApiResponse({
  status: 404,
  description: 'Livro não encontrado'
})
@ApiResponse({
  status: 403,
  description: 'Sem permissão para deletar'
})
removeBook(@Param('id', ParseIntPipe) id: number) {
  return this.booksService.remove(id);
}
```

---

## 🔧 Estrutura OpenAPI 3.0

### Exemplo Completo em JSON

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Library Management API",
    "description": "API completa de gerenciamento de biblioteca",
    "version": "1.0.0",
    "contact": {
      "name": "Suporte",
      "email": "support@biblioteca.com",
      "url": "https://biblioteca.com/support"
    },
    "license": {
      "name": "MIT",
      "url": "https://opensource.org/licenses/MIT"
    }
  },
  "servers": [
    {
      "url": "http://localhost:3000",
      "description": "Desenvolvimento"
    },
    {
      "url": "https://api.biblioteca.com",
      "description": "Produção"
    }
  ],
  "tags": [
    {
      "name": "Auth",
      "description": "Autenticação e autorização"
    },
    {
      "name": "Books",
      "description": "Gerenciamento de livros"
    },
    {
      "name": "Loans",
      "description": "Gerenciamento de empréstimos"
    }
  ],
  "paths": {
    "/api/v1/auth/login": {
      "post": {
        "summary": "Fazer login",
        "operationId": "AuthController_login",
        "tags": ["Auth"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": {
                    "type": "string",
                    "format": "email",
                    "example": "john@example.com"
                  },
                  "password": {
                    "type": "string",
                    "example": "senha123",
                    "minLength": 5
                  }
                },
                "required": ["email", "password"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login realizado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "access_token": {
                      "type": "string",
                      "example": "eyJhbGc..."
                    },
                    "user": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "number" },
                        "name": { "type": "string" },
                        "email": { "type": "string" },
                        "role": { "type": "string" }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Credenciais inválidas"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "number" },
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "role": { "type": "string", "enum": ["ADMIN", "LIBRARIAN", "STUDENT"] },
          "createdAt": { "type": "string", "format": "date-time" }
        },
        "required": ["id", "name", "email", "role", "createdAt"]
      },
      "Book": {
        "type": "object",
        "properties": {
          "id": { "type": "number" },
          "title": { "type": "string" },
          "author": { "type": "string" },
          "isbn": { "type": "string" },
          "quantity": { "type": "number", "minimum": 1 },
          "available": { "type": "number", "minimum": 0 },
          "imageUrl": { "type": "string" },
          "createdAt": { "type": "string", "format": "date-time" }
        },
        "required": ["id", "title", "author", "isbn", "quantity", "available"]
      },
      "Loan": {
        "type": "object",
        "properties": {
          "id": { "type": "number" },
          "userId": { "type": "number" },
          "bookId": { "type": "number" },
          "loanDate": { "type": "string", "format": "date-time" },
          "returnDate": { "type": "string", "format": "date-time" },
          "returnedAt": { "type": "string", "format": "date-time", "nullable": true },
          "status": { "type": "string", "enum": ["PENDING", "APPROVED", "RETURNED", "REJECTED"] }
        },
        "required": ["id", "userId", "bookId", "loanDate", "status"]
      }
    },
    "securitySchemes": {
      "jwt-auth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT Authorization header using the Bearer scheme"
      }
    }
  },
  "security": [
    {
      "jwt-auth": []
    }
  ]
}
```

---

## ⚙️ Configurações Avançadas

### 1. Customizar Cores no Swagger UI

```typescript
// main.ts
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    deepLinking: true,
    defaultModelsExpandDepth: 1,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    persistAuthorization: true, // Manter token após reload
    tryItOutEnabled: true,
    urls: [
      {
        url: 'http://localhost:3000/swagger/v1.json',
        name: 'Versão 1'
      },
      {
        url: 'http://localhost:3000/swagger/v2.json',
        name: 'Versão 2'
      }
    ]
  },
  customCss: `
    .topbar { background-color: #1a1a1a; }
    .swagger-ui .topbar-wrapper { background-color: #1a1a1a; }
    .swagger-ui .info .title { color: #1976d2; }
  `,
  customSiteTitle: 'Library API Docs'
});
```

---

### 2. Documentação de Erro Global

```typescript
@Get('books')
@ApiResponse({
  status: 500,
  description: 'Erro interno do servidor',
  schema: {
    example: {
      statusCode: 500,
      message: 'Erro ao processar requisição',
      timestamp: '2025-01-01T10:30:45.123Z',
      path: '/api/v1/books'
    }
  }
})
async findAll() {
  // ...
}
```

---

### 3. Múltiplas Respostas de Sucesso

```typescript
@Post('auth/login')
@ApiResponse({
  status: 200,
  description: 'Login bem-sucedido - Usuário Admin',
  schema: {
    example: {
      access_token: 'token...',
      user: { role: 'ADMIN' }
    }
  }
})
@ApiResponse({
  status: 200,
  description: 'Login bem-sucedido - Usuário Student',
  schema: {
    example: {
      access_token: 'token...',
      user: { role: 'STUDENT' }
    }
  }
})
login(@Body() dto: LoginDto) { }
```

---

### 4. Filtrar Endpoints por Tag

```typescript
// No Swagger UI, clique na tag para expandir/recolher
// Customize o comportamento:
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    defaultModelsExpandDepth: 0, // Não expandir modelos por padrão
    docExpansion: 'list', // Listar operações
    filter: true, // Ativar busca
    showRequestHeaders: true,
    persistAuthorization: true
  }
});
```

---

## 🎬 Próximos Passos

1. **Testar no Swagger UI:** http://localhost:3000/api
2. **Gerar cliente TypeScript:** `npx swagger-typescript-api`
3. **Exportar OpenAPI:** http://localhost:3000/api-json
4. **Integrar em CI/CD:** Validar OpenAPI em builds

---

## 📚 Recursos

- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [Swagger Editor](https://editor.swagger.io)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

