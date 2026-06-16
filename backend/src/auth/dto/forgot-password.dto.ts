// CC-BY-SA 4.0 — TFG Peluquería

import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'cliente@email.com' })
  @IsEmail({}, { message: 'Introduce un email válido' })
  @IsNotEmpty()
  email!: string;
}
