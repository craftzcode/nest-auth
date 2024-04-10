import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards
} from '@nestjs/common'

import { UpdateUserDto } from '../auth/dto/update-user.dto'
import { UserEntity } from './entities/user.entity'
import { UsersService } from './users.service'
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAccessTokenGuard)
  async getAllUsers(): Promise<UserEntity[]> {
    const users = await this.usersService.getAllUsers()
    return users.map(user => new UserEntity(user))
  }

  @Get(':id')
  @UseGuards(JwtAccessTokenGuard)
  async getUserById(@Param('id') id: string): Promise<UserEntity> {
    const user = await this.usersService.getUserById(id)
    return new UserEntity(user)
  }

  @Patch(':id')
  @UseGuards(JwtAccessTokenGuard)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto)
  }

  @Delete(':id')
  @UseGuards(JwtAccessTokenGuard)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id)
  }
}
