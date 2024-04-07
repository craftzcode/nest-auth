import { Response } from 'express'

import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'

import { LoginDto } from './dto/login.dto'
import { AuthEntity } from './entities/auth.entity'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signup(createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto)
  }

  async login(loginDto: LoginDto): Promise<AuthEntity> {
    const user = await this.usersService.getUserByUsernameOrEmail(
      loginDto.usernameOrEmail
    )

    if (!user) throw new NotFoundException('Incorrect username or password.')

    const passwordMatch = await bcrypt.compare(loginDto.password, user.password)

    if (!passwordMatch)
      throw new NotFoundException('Incorrect username or password.')

    const tokens = await this.createOrUpdateUserSession(user.id)

    return { ...tokens }
  }

  async createSession(userId: string, sessionToken: string) {
    await this.prismaService.session.create({
      data: {
        sessionToken,
        expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        user: {
          connect: {
            id: userId
          }
        }
      }
    })
  }

  async getSessionBySessionToken(refreshToken: string) {
    return await this.prismaService.session.findUnique({
      where: {
        sessionToken: refreshToken
      },
      include: {
        user: true
      }
    })
  }

  async updateSession(id: string, refreshToken: string) {
    await this.prismaService.session.update({
      where: {
        id
      },
      data: {
        sessionToken: refreshToken,
        expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    })
  }

  async generateTokens(userId: string): Promise<AuthEntity> {
    const user = await this.usersService.getUserById(userId)

    if (!user) throw new UnauthorizedException()

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: user.id
        },
        {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: '10s' // Change this to 15m
        }
      ),
      this.jwtService.signAsync(
        { id: user.id },
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: '1m' // Change this to 7d
        }
      )
    ])

    return { accessToken, refreshToken }
  }

  async createOrUpdateUserSession(
    userId?: string,
    refreshToken?: string
  ): Promise<AuthEntity> {
    if (refreshToken) {
      const userSession = await this.getSessionBySessionToken(refreshToken)

      if (!userSession) throw new UnauthorizedException()

      const tokens = await this.generateTokens(userSession.user.id)

      await this.updateSession(userSession.id, tokens.refreshToken)

      return { ...tokens }
    }

    if (userId) {
      let tokens: AuthEntity

      tokens = await this.generateTokens(userId)

      const userSession = await this.getSessionBySessionToken(
        tokens.refreshToken
      )

      if (userSession) tokens = await this.generateTokens(userId)

      await this.createSession(userId, tokens.refreshToken)

      return { ...tokens }
    }
  }

  async storeRefreshTokenToCookie(res: Response, refreshToken: string) {
    res.cookie('jwt-refresh-token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
  }
}
