import { IsDate, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateWeddingDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @IsNotEmpty()
  eventDate: Date;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  coupleName: string;
}
