import { IsNumber } from 'class-validator';

export class CreateGiftReservationDto {
    @IsNumber()
    giftId: number;
}
