import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { GiftStatus } from '../enums/gift.enum';

export class ListGiftDto {
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? Number(value) : undefined)
    coupleId?: number;

    @IsOptional()
    @IsEnum(GiftStatus)
    @Transform(({ value }) => value ? Number(value) : undefined)
    statusId?: GiftStatus;
}
