import { Request, Response } from 'express'

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
import { CreateUserDto } from 'src/auth/dto/create-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  //! SIGNUP
  async signup(createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto)
  }

  //! LOGIN
  async login(loginDto: LoginDto): Promise<AuthEntity> {
    const user = await this.usersService.getUserByUsernameOrEmail(
      loginDto.usernameOrEmail
    )

    if (!user) throw new NotFoundException('Incorrect username or email')

    const passwordMatch = await bcrypt.compare(loginDto.password, user.password)

    if (!passwordMatch) throw new UnauthorizedException('Incorrect password')

    const accessToken = await this.generateAccessToken(user.id)
    const refreshToken = await this.generateRefreshToken(user.id)

    return { accessToken, refreshToken }
  }

  //! GENERATE ACCESS TOKEN
  async generateAccessToken(userId: string): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      { id: userId },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '10s' // 15m
      }
    )

    return accessToken
  }

  //! GENERATE REFRESH TOKEN
  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      { id: userId },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '1m' // 7d
      }
    )

    return refreshToken
  }

  //! STORE REFRESH TOKEN IN COOKIE
  storeRefreshTokenInCookie(response: Response, refreshToken: string) {
    response.cookie('jwtRefreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 1000 // 7 * 24 * 60 * 60 * 1000
    })
  }

  //! DELETE REFRESH TOKEN FROM COOKIE
  deleteRefreshTokenFromCookie(response: Response) {
    response.clearCookie('jwtRefreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
  }

  // async login(loginDto: LoginDto): Promise<AuthEntity> {
  //   const user = await this.usersService.getUserByUsernameOrEmail(
  //     loginDto.usernameOrEmail
  //   )

  //   if (!user) throw new NotFoundException('Incorrect username or password.')

  //   const passwordMatch = await bcrypt.compare(loginDto.password, user.password)

  //   if (!passwordMatch)
  //     throw new NotFoundException('Incorrect username or password.')

  //   const tokens = await this.createOrUpdateUserSession({ userId: user.id })

  //   return { ...tokens }
  // }

  // async logout(refreshToken: string) {
  //   const userSession = await this.getSessionBySessionToken(refreshToken)

  //   if (!userSession) throw new UnauthorizedException()

  //   await this.deleteSession(userSession.id)
  // }

  // async createSession(userId: string, sessionToken: string) {
  //   await this.prismaService.session.create({
  //     data: {
  //       sessionToken,
  //       expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  //       user: {
  //         connect: {
  //           id: userId
  //         }
  //       }
  //     }
  //   })
  // }

  // async getSessionBySessionToken(refreshToken: string) {
  //   return await this.prismaService.session.findUnique({
  //     where: {
  //       sessionToken: refreshToken
  //     },
  //     include: {
  //       user: true
  //     }
  //   })
  // }

  // async updateSession(id: string, refreshToken: string) {
  //   await this.prismaService.session.update({
  //     where: {
  //       id
  //     },
  //     data: {
  //       sessionToken: refreshToken,
  //       expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
  //     }
  //   })
  // }

  // async deleteSession(id: string) {
  //   await this.prismaService.session.delete({ where: { id } })
  // }

  // async generateTokens(userId: string): Promise<AuthEntity> {
  //   const user = await this.usersService.getUserById(userId)

  //   if (!user) throw new UnauthorizedException()

  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.jwtService.signAsync(
  //       {
  //         id: user.id
  //       },
  //       {
  //         secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
  //         expiresIn: '10s' // Change this to 15m
  //       }
  //     ),
  //     this.jwtService.signAsync(
  //       { id: user.id },
  //       {
  //         secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
  //         expiresIn: '7d' // Change this to 7d
  //       }
  //     )
  //   ])

  //   return { accessToken, refreshToken }
  // }

  // // TODO: Change the flow of this function, if the refresh token is not exists in the database clear the cookie
  // // TODO: Or remove the checking of refresh token in the database, place it inside of (JwtRefreshTokenStrategy) and if the refresh token is not exists in the database clear the cookie
  // async createOrUpdateUserSession({
  //   userId,
  //   refreshToken
  // }: {
  //   userId?: string
  //   refreshToken?: string
  // }) {
  //   if (refreshToken) {
  //     const userSession = await this.getSessionBySessionToken(refreshToken)

  //     if (!userSession) throw new UnauthorizedException()

  //     const tokens = await this.generateTokens(userSession.user.id)

  //     await this.updateSession(userSession.id, tokens.refreshToken)

  //     return { ...tokens }
  //   }

  //   if (userId) {
  //     let tokens: AuthEntity

  //     tokens = await this.generateTokens(userId)

  //     const userSession = await this.getSessionBySessionToken(
  //       tokens.refreshToken
  //     )

  //     if (userSession) tokens = await this.generateTokens(userId)

  //     await this.createSession(userId, tokens.refreshToken)

  //     return { ...tokens }
  //   }
  // }

  // async refreshAccessToken(refreshToken: string): Promise<AuthEntity> {
  //   const tokens = await this.createOrUpdateUserSession({ refreshToken })

  //   return { ...tokens }
  // }

  // storeRefreshTokenInCookie(response: Response, refreshToken: string) {
  //   response.cookie('jwtRefreshToken', refreshToken, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'none',
  //     maxAge: 7 * 24 * 60 * 60 * 1000
  //   })
  // }

  // async deleteRefreshTokenFromCookie(response: Response) {
  //   response.clearCookie('jwtRefreshToken', {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'none'
  //   })
  // }
}
