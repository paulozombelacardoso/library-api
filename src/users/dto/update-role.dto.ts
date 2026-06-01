import { Role } from '../../common/enums/role.enum';
import { IsEnum } from 'class-validator';

export class UpdateDto {
  @IsEnum(Role)
  role!: Role;
}
