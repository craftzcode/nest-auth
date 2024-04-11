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
import { GetRequestUser } from 'src/common/decoratoras/get-request-user'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { JwtAccessTokenGuard } from './guards/jwt-access-token.guard'
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard'
import { CreateUserDto } from 'src/auth/dto/create-user.dto'
import { UserEntity } from 'src/users/entities/user.entity'

@Controller('auth')
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
    const {
      accessToken,
      refreshToken,
      user: userData
    } = await this.authService.login(loginDto)

    this.authService.storeRefreshTokenInCookie(res, refreshToken)

    const user = new UserEntity(userData)

    return { accessToken, user }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.deleteRefreshTokenFromCookie(res)
  }

  @Get('refresh-access-token')
  @UseGuards(JwtRefreshTokenGuard)
  async refreshAccssToken(@GetRequestUser() reqUser: UserEntity) {
    const accessToken = await this.authService.generateAccessToken(reqUser.id)

    return { accessToken }
  }

  @Get('get-current-user')
  @UseGuards(JwtRefreshTokenGuard)
  getCurrentUser(@GetRequestUser() reqUser: UserEntity) {
    return { user: reqUser }
  }

  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // async login(
  //   @Res({ passthrough: true }) response: Response,
  //   @Body() loginDto: LoginDto
  // ) {
  //   const { accessToken, refreshToken } = await this.authService.login(loginDto)

  //   this.authService.storeRefreshTokenInCookie(response, refreshToken)

  //   return { accessToken }
  // }

  // @Post('logout')
  // @HttpCode(HttpStatus.OK)
  // async logout(
  //   @Res({ passthrough: true }) response: Response
  //   @GetRequestRefreshToken() refreshToken: string
  // ) {
  //   await this.authService.logout(refreshToken)

  //   this.authService.deleteRefreshTokenFromCookie(response)

  //   return true
  // }

  // @Get('refresh-access-token')
  // @UseGuards(JwtRefreshTokenGuard)
  // async refreshAccessToken(
  //   @Res({ passthrough: true }) response: Response,
  //   @GetRequestRefreshToken() oldJwtRefreshToken: string
  // ) {
  //   const { accessToken, refreshToken: newJwtRefreshToken } =
  //     await this.authService.refreshAccessToken(oldJwtRefreshToken)

  //   this.authService.storeRefreshTokenInCookie(response, newJwtRefreshToken)

  //   return { accessToken }
  // }

  // @Get('get-user-session')
  // @UseGuards(JwtRefreshTokenGuard)
  // async getUserSession(@GetRequestUser() getUserSession: UserEntity) {
  //   return { user: getUserSession }
  // }
}
