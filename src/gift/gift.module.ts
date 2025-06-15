import { Module, forwardRef } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftRepository } from './gift.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { GiftController } from './gift.controller';
import { GiftPaymentModule } from '../gift-payment/gift-payment.module';
import { FileModule } from '../file/file.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => GiftPaymentModule),
        FileModule,
        AuthModule
    ],
    controllers: [GiftController],
    providers: [GiftService, GiftRepository],
    exports: [GiftService, GiftRepository]
})
export class GiftModule {}
