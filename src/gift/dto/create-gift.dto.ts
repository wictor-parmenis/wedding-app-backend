import { IsNumber, IsString, IsUrl, MinLength, Min } from 'class-validator';

export class CreateGiftDto {
    @IsNumber()
    weddingId: number;

    @IsUrl()
    urlImage: string;

    @IsString()
    @MinLength(3)
    description: string;

    @IsNumber()
    @Min(0)
    price: number;
}
