import { Module, forwardRef } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftRepository } from './gift.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { GiftController } from './gift.controller';
import { GiftPaymentModule } from '../gift-payment/gift-payment.module';
import { FileModule } from '../file/file.module';
import { AuthModule } from '../auth/auth.module';
import { GiftReservationModule } from 'src/gift-reservation/gift-reservation.module';
import { GiftAdminController } from './gift.admin.controller';

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => GiftPaymentModule),
        FileModule,
        AuthModule,
        GiftReservationModule
    ],
    controllers: [GiftController, GiftAdminController],
    providers: [GiftService, GiftRepository],
    exports: [GiftService, GiftRepository]
})
export class GiftModule {}
