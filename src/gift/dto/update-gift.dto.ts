import { IsNumber, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';

export class UpdateGiftDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsUrl()
    urlImage?: string;
}
