import { Module } from '@nestjs/common';
import { GiftReservationService } from './gift-reservation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [GiftReservationService],
    exports: [GiftReservationService]
})
export class GiftReservationModule {}
