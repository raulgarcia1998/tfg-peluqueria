// CC-BY-SA 4.0 — TFG Peluquería

import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token recibido en el enlace de recuperación' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ minLength: 6, example: 'nuevaClave123' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword!: string;
}
