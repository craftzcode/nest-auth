// import { AuthGuard } from '@nestjs/passport'

// export class JwtRefreshTokenGuard extends AuthGuard('jwt-refresh-token') {}

import { Request } from 'express'

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtRefreshTokenGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>()
    const refreshToken = this.extractFromCookie(request)

    if (!refreshToken) throw new UnauthorizedException()

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')
      })
    } catch (error) {
      console.log(error)
      throw new UnauthorizedException()
    }

    return true
  }

  private extractFromCookie(request: Request): string | undefined {
    const { jwtRefreshToken } = request.cookies

    return jwtRefreshToken
  }
}
