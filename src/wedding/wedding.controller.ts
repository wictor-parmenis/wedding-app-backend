import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { WeddingService } from './wedding.service';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';

@Controller('wedding')
@UseGuards(FirebaseAuthGuard)
export class WeddingController {
  constructor(private readonly weddingService: WeddingService) {}

  @Post()
  create(@Body() createWeddingDto: CreateWeddingDto, @CurrentUser() user: any) {
    return this.weddingService.create(createWeddingDto, user.id);
  }
}
