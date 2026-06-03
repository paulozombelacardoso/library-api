import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BooksModule,
    UsersModule,
    CloudinaryModule,
    LoansModule,
  ],
})
export class AppModule {}
