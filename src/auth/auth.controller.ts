import { Response } from 'express'

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { CreateUserDto } from 'src/users/dto/create-user.dto'

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto
  ) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto)

    this.authService.storeRefreshTokenToCookie(res, refreshToken)

    return { accessToken }
  }

  @Get('refresh')
  refresh() {
    return
  }
}
