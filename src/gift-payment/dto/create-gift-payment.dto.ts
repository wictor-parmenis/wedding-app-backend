import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateGiftPaymentDto {
    @IsInt()
    giftId: number;

    @IsInt()
    userId: number;

    @IsInt()
    amount: number;

    @IsInt()
    paymentMethodId: number;

    @IsString()
    @IsOptional()
    transactionId?: string;
}
