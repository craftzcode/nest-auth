import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'

import * as bcrypt from 'bcrypt'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  //! Create User
  async createUser(createUserDto: CreateUserDto) {
    const { name, username, email, password } = createUserDto

    const usernameExisted = await this.getUserByUsername(username)

    if (usernameExisted)
      throw new ConflictException('Username has already taken.')

    const emailExisted = await this.getUserByEmail(email)

    if (emailExisted) throw new ConflictException('Email has already taken.')

    const hashedPassword = await bcrypt.hash(password, 10)

    await this.prismaService.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword
      }
    })

    return { message: 'Sign-up successful.' }
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            username: usernameOrEmail
          },
          {
            email: usernameOrEmail
          }
        ]
      }
    })

    return user
  }

  //! Get All Users
  async getAllUsers() {
    const users = await this.prismaService.user.findMany()
    return users
  }

  //! Get User By Id
  async getUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id
      }
    })

    return user
  }

  //! Update User
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.getUserById(id)

    if (!user) throw new NotFoundException('User not found.')

    if (updateUserDto.name || updateUserDto.image) {
      await this.prismaService.user.update({
        where: {
          id: user.id
        },
        data: {
          name: updateUserDto.name,
          image: updateUserDto.image
        }
      })

      return { message: 'Profile updated successfully.' }
    }

    if (updateUserDto.username) {
      const usernameExisted = await this.getUserByUsername(
        updateUserDto.username
      )

      if (usernameExisted)
        throw new ConflictException('Username has already taken.')

      await this.prismaService.user.update({
        where: {
          id: user.id
        },
        data: {
          username: updateUserDto.username
        }
      })

      return { message: 'Username changed successfully.' }
    }

    if (updateUserDto.email) {
      const emailExisted = await this.getUserByEmail(updateUserDto.email)

      if (emailExisted) throw new ConflictException('Email has already taken.')

      // TODO: Send email verification

      await this.prismaService.user.update({
        where: {
          id: user.id
        },
        data: {
          email: updateUserDto.email
        }
      })

      return { message: 'Email changed successfully.' }
    }

    if (updateUserDto.oldPassword && updateUserDto.password) {
      const passwordMatch = await bcrypt.compare(
        updateUserDto.oldPassword,
        user.password
      )

      if (!passwordMatch)
        throw new UnauthorizedException('Incorrect old password.')

      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10)

      // TODO: Send changed password notification email

      await this.prismaService.user.update({
        where: {
          id: user.id
        },
        data: {
          password: hashedPassword
        }
      })

      return { message: 'Password changed successfully.' }
    }
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id)

    if (!user) throw new NotFoundException('User not found.')

    return { message: 'User successfully deleted.' }
  }

  async getUserByUsername(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username
      }
    })

    return user
  }

  async getUserByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email
      }
    })

    return user
  }
}
