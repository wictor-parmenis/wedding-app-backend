import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(username, email, password);
  }

  @Get('me')
  async getProfile(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    return this.authService.validateFirebaseToken(token);
  }

  @Post('profile')
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @Body('displayName') displayName?: string,
    @Body('photoURL') photoURL?: string,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const user = await this.authService.validateFirebaseToken(token);

    return this.authService.updateUserProfile(user.uid, {
      displayName,
      photoURL,
    });
  }

  @Post('test-token')
  async generateTestToken(@Body('email') email: string) {
    return this.authService.generateTestToken(email);
  }

  @Post('update-password')
  async changePassword(
    @Headers('authorization') authHeader: string,
    @Body('new_password') newPassword: string,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const user = await this.authService.validateFirebaseToken(token);

    return this.authService.updatePassword(user.uid, newPassword);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }
}
