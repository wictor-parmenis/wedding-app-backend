import { IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteGiftDto {
    @IsNumber()
    @IsPositive()
    @Transform(({ value }) => Number(value))
    id: number;
}
