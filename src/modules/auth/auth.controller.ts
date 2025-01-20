import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginUserDto, RefreshTokenDto, RegisterUserDto } from './dtos';
import { AuthGuard } from './guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() dto: LoginUserDto) {
    return this.authService.authenticateUser(dto);
  }

  @Post('/register')
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshUserToken(dto.refresh_token);
  }

  @Get('/profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCurrentProfile(@Request() req: any) {
    return this.authService.getUserProfile(req.user.user_id);
  }
}
