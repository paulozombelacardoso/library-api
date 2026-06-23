import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * Configuração da documentação Swagger/OpenAPI
 * Versão: 1.0.0
 * Ambiente: Production-ready
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors();

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription(
      `
# API de Gerenciamento de Biblioteca

Sistema completo de gerenciamento de biblioteca com autenticação JWT, gestão de usuários, livros e empréstimos.

## Recursos Principais

- ✅ **Autenticação JWT**: Segurança com Bearer Token
- ✅ **Controle de Acesso por Papel (RBAC)**: Admin, Librarian, Student
- ✅ **Gestão de Livros**: CRUD completo com upload de imagens
- ✅ **Sistema de Empréstimos**: Requisição, aprovação e devolução
- ✅ **Validação em Tempo Real**: Class-validator integrado
- ✅ **Banco de Dados**: PostgreSQL com Prisma ORM

## Fluxo de Autenticação

\`\`\`
1. Usuário faz POST /api/v1/auth/register
2. Sistema retorna JWT token
3. Usuário usa o token no header: Authorization: Bearer <token>
4. Token é validado por cada requisição protegida
\`\`\`

## Papéis e Permissões

| Papel | Descrição | Permissões |
|-------|-----------|-----------|
| **ADMIN** | Administrador | Gerenciar usuários, livros, empréstimos |
| **LIBRARIAN** | Bibliotecário | Gerenciar livros e aprovar empréstimos |
| **STUDENT** | Aluno | Solicitar empréstimos |

## Versionamento de API

Todas as rotas utilizam versionamento: \`/api/v1\`

## Códigos de Status HTTP

- \`200 OK\`: Sucesso
- \`201 Created\`: Recurso criado
- \`204 No Content\`: Sucesso sem conteúdo
- \`400 Bad Request\`: Dados inválidos
- \`401 Unauthorized\`: Não autenticado
- \`403 Forbidden\`: Sem permissão
- \`404 Not Found\`: Recurso não encontrado
- \`500 Internal Server Error\`: Erro do servidor
      `,
    )
    .setVersion('1.0.0')
    .addTag('Auth', 'Endpoints de autenticação e autorização')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Books', 'Gerenciamento de livros')
    .addTag('Loans', 'Gerenciamento de empréstimos')
    .addServer(`http://localhost:${process.env.PORT ?? 3000}`, 'Desenvolvimento')
    .addServer('https://api.biblioteca.com/api/v1', 'Produção')
    .setContact(
      'Suporte API',
      'https://biblioteca.com/support',
      'support@biblioteca.com',
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token',
      },
      'jwt-auth',
    )
    .setBasePath('/')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });

  // Configuração de documentação
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      // Configurações de UI
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
  });

  // Prefixo global de rotas
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
