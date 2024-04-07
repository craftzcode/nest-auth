import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [PrismaModule, UsersModule, PassportModule, JwtModule.register({})],
  providers: [AuthService, JwtAccessTokenStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
