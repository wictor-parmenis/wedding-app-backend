import { IsEnum } from 'class-validator';
import { GiftStatus } from '../enums/gift.enum';

export class UpdateGiftStatusDto {
    @IsEnum(GiftStatus)
    statusId: GiftStatus;
}
