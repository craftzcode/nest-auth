import { User } from '@prisma/client'
//! For validation
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

//! (implements) to take all types
export class CreateUserDto
  implements Omit<User, 'id' | 'emailVerified' | 'image' | 'role'>
{
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  username: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsString()
  image?: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string
}
