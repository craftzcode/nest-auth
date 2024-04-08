import { Request } from 'express'

import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { ExtractJwt, Strategy } from 'passport-jwt'

import { AuthService } from '../auth.service'

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token'
) {
  constructor(
    configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      //! The (jwtFromRequest) option expects a method that can be used to extract the JWT from the request
      //! In this case, we will use our own extractor (extractTokenFromCookies)
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshTokenStrategy.fromCookie
      ]),
      ignoreExpiration: false,
      //! The (secretOrKey) option tells the strategy what secret to use to verify the JWT
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      //! If true the request will be passed to the verify callback. (i.e. verify(request, jwt_payload, done_callback))
      //! In short we can use (Request) in (validate)
      passReqToCallback: true
    })
  }

  async validate(request: Request, payload: { id: string }) {
    const jwtRefreshToken = JwtRefreshTokenStrategy.fromCookie(request)

    const userSession =
      await this.authService.getSessionBySessionToken(jwtRefreshToken)

    if (!userSession) throw new UnauthorizedException()

    return
  }

  private static fromCookie(request: Request): string | undefined {
    const { jwtRefreshToken } = request.cookies

    if (!jwtRefreshToken) throw new UnauthorizedException()

    return jwtRefreshToken
  }
}
