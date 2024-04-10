import { PartialType } from '@nestjs/mapped-types'

import { CreateUserDto } from './create-user.dto'

//! (extends) to take all the value, (PartialType) to convert all the value to being optional
export class UpdateUserDto extends PartialType(CreateUserDto) {
  oldPassword?: string
}
