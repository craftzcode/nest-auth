import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { ExtractJwt, Strategy } from 'passport-jwt'

import { UsersService } from 'src/users/users.service'

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token'
) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      //! The (jwtFromRequest) option expects a method that can be used to extract the JWT from the request
      //! In this case, you will use the standard approach of supplying a bearer token in the Authorization header of our API requests
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //! The (secretOrKey) option tells the strategy what secret to use to verify the JWT
      ignoreExpiration: false,
      //! The (secretOrKey) option tells the strategy what secret to use to verify the JWT
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET')
    })
  }

  async validate(payload: { id: string }) {
    const user = await this.usersService.getUserById(payload.id)

    if (!user) throw new UnauthorizedException()

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image,
      role: user.role
    }
  }
}
