import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';
import { IsEnum } from 'class-validator';

export class UpdateDto {
  @ApiProperty({
    description: 'Novo papel/função do usuário no sistema',
    enum: ['ADMIN', 'LIBRARIAN', 'STUDENT'],
    example: 'ADMIN',
  })
  @IsEnum(Role, { message: 'Role deve ser ADMIN, LIBRARIAN ou STUDENT' })
  role!: Role;
}
