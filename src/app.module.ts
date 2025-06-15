import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GiftModule } from './gift/gift.module';
import { FileModule } from './file/file.module';
import { WeddingModule } from './wedding/wedding.module';

@Module({
  imports: [AuthModule, UserModule, GiftModule, FileModule, WeddingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
