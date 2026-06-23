# 📚 Documentação da API de Biblioteca (NestJS + Swagger/OpenAPI 3.0)

Esta documentação provê todos os exemplos práticos, estruturas recomendadas e anotações `@nestjs/swagger` necessários para configurar um portal do desenvolvedor profissional em sua API.

---

## 1. Descrição Geral da API
A API de Gerenciamento de Biblioteca é um backend seguro e escalável em **NestJS**, desenvolvido para controle de acervo e empréstimos de livros. 
A arquitetura expõe serviços RESTful com os principais módulos:
- **Auth**: Registro de contas e emissão de tokens JWT.
- **Users**: Gerenciamento de usuários e perfis.
- **Books**: Cadastro e manutenção do acervo literário.
- **Loans**: Lógica de negócios para realização, controle de prazos e devolução de empréstimos de livros.

## 2. Boas Práticas (Versionamento e OpenAPI 3.0)
Para proteger contra _breaking changes_, é recomendado manter os endpoints sob um prefixo versionado, como `/api/v1`.
A estrutura recomendada utilizando **OpenAPI 3.0** via `@nestjs/swagger` inclui:
- Definição clara de `tags` lógicas (agrupando rotas no Swagger UI).
- Documentação explícita do esquema de segurança (Bearer Token).
- Retornos categorizados, cobrindo não apenas `200/201` (Sucesso), mas os principais erros operacionais (`400`, `401`, `403`, `404`, `500`).

## 3. Fluxo de Autenticação JWT & Autorização (ADMIN vs USER)
O sistema exige autenticação por JWT:
1. O cliente chama `POST /auth/login` e recebe um token na resposta (`accessToken`).
2. O cliente injeta no Header das próximas requisições: `Authorization: Bearer <token>`.
3. O `JwtAuthGuard` valida o token e popula o objeto de requisição com o `userId` e o `role`.
4. O `RolesGuard` analisa o `role`:
   - **`ADMIN`**: Tem privilégios globais (criar livros, excluir usuários, listar todos os empréstimos do sistema).
   - **`USER`**: Limitado a operações de leitura (buscar livros) e realizar seus próprios empréstimos.

---

## 4. Configuração Inicial (`main.ts`)
Este código deve ser inserido na inicialização da sua aplicação para habilitar o Swagger UI e persistência de autenticação (facilitando testes repetitivos na interface).

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Boas Práticas: Prefixo Global e Versionamento da API
  app.setGlobalPrefix('api/v1');

  // Habilita validação através dos DTOs globais
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuração Estrutural do OpenAPI 3.0
  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription('API RESTful robusta para controle de acervo e empréstimos de livros em bibliotecas, com autenticação JWT e controle de papéis de acesso (RBAC).')
    .setVersion('1.0.0')
    .addTag('Auth', 'Endpoints de autenticação e registro de usuários')
    .addTag('Users', 'Gerenciamento de contas e informações de usuários')
    .addTag('Books', 'Gerenciamento e pesquisa do acervo literário')
    .addTag('Loans', 'Lógica de negócios e controle de empréstimos/devoluções')
    // Configuração do Bearer Token no Swagger
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT retornado no login.',
        in: 'header',
      },
      'JWT-auth', // Referência interna
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Customizações para o Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Evita a perda do token JWT ao recarregar a página da doc
    },
    customSiteTitle: 'Docs | Library API',
  });

  await app.listen(3000);
}
bootstrap();
```

---

## 5. DTOs Documentados

### `src/users/dto/user.dto.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'b0e008ca-5d77-4cf7-8025-ab78e07bebd7', description: 'ID único do usuário (UUID)' })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'Nome completo' })
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'E-mail utilizado para acesso' })
  email: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'USER'], description: 'Papel do usuário no sistema' })
  role: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z', description: 'Data de criação do registro' })
  createdAt: Date;
}
```

### `src/books/dto/book.dto.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code', description: 'Título da obra' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Robert C. Martin', description: 'Autor da obra' })
  @IsString()
  author: string;

  @ApiProperty({ example: '9780132350884', description: 'Código ISBN de 13 dígitos' })
  @IsString()
  isbn: string;

  @ApiProperty({ example: 10, description: 'Quantidade inicial para o estoque da biblioteca' })
  @IsInt()
  @Min(0)
  quantity: number;
}

export class BookResponseDto extends CreateBookDto {
  @ApiProperty({ example: '85f396cc-60e5-420a-9d90-2c7028b99d63', description: 'ID exclusivo do livro' })
  id: string;

  @ApiProperty({ example: 8, description: 'Quantidade de exemplares atualmente disponíveis para empréstimo' })
  available: number;
}
```

### `src/loans/dto/loan.dto.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateLoanDto {
  @ApiProperty({ example: '85f396cc-60e5-420a-9d90-2c7028b99d63', description: 'ID do livro a ser emprestado' })
  @IsUUID()
  bookId: string;
}

export class LoanResponseDto {
  @ApiProperty({ example: '11e54ca6-8051-40be-bdcd-066bcfa0e8b1' })
  id: string;

  @ApiProperty({ example: 'b0e008ca-5d77-4cf7-8025-ab78e07bebd7', description: 'ID do usuário que solicitou' })
  userId: string;

  @ApiProperty({ example: '85f396cc-60e5-420a-9d90-2c7028b99d63', description: 'ID do livro vinculado' })
  bookId: string;

  @ApiProperty({ example: '2025-01-01', description: 'Data oficial da retirada' })
  loanDate: string;

  @ApiProperty({ example: '2025-01-15', description: 'Data máxima tolerada para devolução' })
  dueDate: string;

  @ApiProperty({ example: null, nullable: true, description: 'Data em que o usuário retornou o exemplar à biblioteca' })
  returnedAt: string | null;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'RETURNED', 'OVERDUE'], description: 'Estado lógico do empréstimo' })
  status: string;
}
```

---

## 6. Decorators nos Controllers (Pronto para Produção)

### `src/auth/auth.controller.ts`
```typescript
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
// import { RegisterDto, LoginDto, TokenResponseDto } from './dto/auth.dto';
// import { UserResponseDto } from '../users/dto/user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  
  @Post('register')
  @ApiOperation({ summary: 'Registrar usuário', description: 'Cria uma nova conta na plataforma (Default Role: USER).' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Falha na validação dos dados ou e-mail já existe.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  register(@Body() body: any) {} // body: RegisterDto

  @Post('login')
  @ApiOperation({ summary: 'Autenticação', description: 'Recebe as credenciais e emite um token JWT.' })
  @ApiResponse({ status: 200, description: 'Autenticação bem-sucedida, retorna o JWT.' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha incorretos.' })
  login(@Body() body: any) {} // body: LoginDto

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(/* JwtAuthGuard */)
  @ApiOperation({ summary: 'Perfil do usuário', description: 'Retorna informações do usuário logado através do token.' })
  @ApiResponse({ status: 200, description: 'Dados do perfil do usuário recuperados.' })
  @ApiResponse({ status: 401, description: 'Token ausente, inválido ou expirado.' })
  getProfile(@Request() req: any) {}
}
```

### `src/users/users.controller.ts`
```typescript
import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
// import { UserResponseDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(/* JwtAuthGuard, RolesGuard */)
@Controller('users')
export class UsersController {
  
  @Get()
  // @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar usuários', description: 'Retorna a listagem geral de usuários. (Acesso: ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista populada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Ação exclusiva para administradores.' })
  findAll() {}

  @Get(':id')
  @ApiOperation({ summary: 'Consultar usuário' })
  @ApiParam({ name: 'id', example: 'b0e008ca-5d77-4cf7-8025-ab78e07bebd7', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Registro localizado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário', description: 'Permite alteração parcial dos dados da conta.' })
  @ApiParam({ name: 'id', description: 'ID do usuário a ser alterado' })
  @ApiResponse({ status: 200, description: 'Dados atualizados com sucesso.' })
  @ApiResponse({ status: 400, description: 'O payload de atualização contém dados incorretos.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  update(@Param('id') id: string, @Body() body: any) {}

  @Delete(':id')
  // @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover conta', description: 'Exclusão física/lógica do usuário. (Acesso: ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID do usuário a ser removido' })
  @ApiResponse({ status: 200, description: 'Usuário excluído.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Usuário não localizado.' })
  remove(@Param('id') id: string) {}
}
```

### `src/books/books.controller.ts`
```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
// import { CreateBookDto, BookResponseDto } from './dto/book.dto';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  
  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(/* JwtAuthGuard, RolesGuard */)
  // @Roles('ADMIN')
  @ApiOperation({ summary: 'Cadastrar novo livro', description: 'Inclusão de livros no acervo. (Acesso: ADMIN)' })
  @ApiResponse({ status: 201, description: 'Livro criado com êxito.' })
  @ApiResponse({ status: 400, description: 'Validação falhou ou ISBN já cadastrado.' })
  @ApiResponse({ status: 403, description: 'Autorização necessária (Admin).' })
  create(@Body() body: any) {}

  @Get()
  @ApiOperation({ summary: 'Explorar acervo', description: 'Lista livros disponíveis. Pode ser acessado de forma pública (sem token).' })
  @ApiQuery({ name: 'title', required: false, description: 'Termo de busca parcial pelo título' })
  @ApiQuery({ name: 'author', required: false, description: 'Filtro por nome do autor' })
  @ApiResponse({ status: 200, description: 'Retorna array de livros cadastrados.' })
  findAll(@Query('title') title?: string, @Query('author') author?: string) {}

  @Get(':id')
  @ApiOperation({ summary: 'Visualizar detalhes do livro' })
  @ApiParam({ name: 'id', description: 'ID interno do livro' })
  @ApiResponse({ status: 200, description: 'Detalhes completos do exemplar.' })
  @ApiResponse({ status: 404, description: 'Livro não registrado.' })
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(/* JwtAuthGuard, RolesGuard */)
  // @Roles('ADMIN')
  @ApiOperation({ summary: 'Editar livro', description: 'Corrige metadados ou altera quantitativo do livro. (Acesso: ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID do livro alvo' })
  @ApiResponse({ status: 200, description: 'Edição concluída.' })
  @ApiResponse({ status: 404, description: 'Livro não registrado.' })
  update(@Param('id') id: string, @Body() body: any) {}

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(/* JwtAuthGuard, RolesGuard */)
  // @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover livro', description: 'Remove livro do acervo permanentemente. (Acesso: ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID do livro' })
  @ApiResponse({ status: 200, description: 'Exclusão processada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente.' })
  @ApiResponse({ status: 404, description: 'Não localizado.' })
  remove(@Param('id') id: string) {}
}
```

### `src/loans/loans.controller.ts`
```typescript
import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
// import { CreateLoanDto } from './dto/loan.dto';

@ApiTags('Loans')
@ApiBearerAuth('JWT-auth')
@UseGuards(/* JwtAuthGuard */)
@Controller('loans')
export class LoansController {
  
  @Post()
  @ApiOperation({ summary: 'Registrar empréstimo', description: 'Vincula um exemplar do livro ao usuário autenticado.' })
  @ApiResponse({ status: 201, description: 'Empréstimo efetivado.' })
  @ApiResponse({ status: 400, description: 'Livro com disponibilidade zerada ou usuário ultrapassou limite de livros simultâneos.' })
  @ApiResponse({ status: 404, description: 'Livro não encontrado no sistema.' })
  create(@Request() req: any, @Body() body: any) {}

  @Get()
  // @Roles('ADMIN')
  @ApiOperation({ summary: 'Histórico global', description: 'Relatório global de todos os empréstimos efetuados (Acesso: ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista extraída.' })
  findAll() {}

  @Get(':id')
  @ApiOperation({ summary: 'Status de um empréstimo', description: 'Consulta dados específicos. Usuários comuns só podem consultar seus próprios registros.' })
  @ApiParam({ name: 'id', description: 'ID do empréstimo' })
  @ApiResponse({ status: 200, description: 'Detalhes da transação.' })
  @ApiResponse({ status: 403, description: 'Tentativa de acessar empréstimo alheio.' })
  @ApiResponse({ status: 404, description: 'Empréstimo inexistente.' })
  findOne(@Param('id') id: string) {}

  @Patch(':id/return')
  @ApiOperation({ summary: 'Efetuar devolução', description: 'Marca o livro como devolvido (returnedAt) e reabastece a quantidade "available" do livro.' })
  @ApiParam({ name: 'id', description: 'ID do empréstimo respectivo' })
  @ApiResponse({ status: 200, description: 'Devolução processada, livro livre novamente.' })
  @ApiResponse({ status: 400, description: 'O empréstimo já possui status RETURNED.' })
  @ApiResponse({ status: 404, description: 'Empréstimo não localizado.' })
  returnBook(@Param('id') id: string) {}
}
```

## 💡 Exemplos de Uso no Swagger UI
Após executar a aplicação com `npm run start:dev`, acesse:
**`http://localhost:3000/api/docs`**

1. Para testar rotas restritas, primeiro chame a rota `/auth/login` (Seção Auth).
2. Copie o campo `accessToken` retornado.
3. No topo da página Swagger, clique no botão 🔒 **Authorize**.
4. Cole o token e aplique. Todos os endpoints marcados com cadeado (e configurados com `@ApiBearerAuth('JWT-auth')`) estarão liberados na interface para simulação completa.
