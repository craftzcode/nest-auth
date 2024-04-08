import { Request, Response } from 'express'

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'

import { GetRequestRefreshToken } from 'src/common/decoratoras/get-request-refresh-token'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard'
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
    @Res({ passthrough: true }) response: Response,
    @Body() loginDto: LoginDto
  ) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto)

    this.authService.storeRefreshTokenInCookie(response, refreshToken)

    return { accessToken }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @GetRequestRefreshToken() refreshToken: string
  ) {
    await this.authService.logout(refreshToken)

    this.authService.deleteRefreshTokenFromCookie(response)

    return true
  }

  @Get('refresh')
  @UseGuards(JwtRefreshTokenGuard)
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @GetRequestRefreshToken() oldJwtRefreshToken: string
  ) {
    const { accessToken, refreshToken: newJwtRefreshToken } =
      await this.authService.refreshAccessToken(oldJwtRefreshToken)

    this.authService.storeRefreshTokenInCookie(response, newJwtRefreshToken)

    return { accessToken }
  }
}
