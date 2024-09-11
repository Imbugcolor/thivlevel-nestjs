import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyTokenDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid id',
  })
  id: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
