import { User } from '@prisma/client'

export class UserEntity implements User {
  //! No we can pass the data to (new UserEntity(data)) to transform the (response) using (toJSON)
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial)
  }

  id: string
  name: string
  username: string
  email: string
  emailVerified: Date
  image: string
  password: string

  //! We add a toJSON method to the class, which returns an object containing all properties of the UserEntity instance except for the password property
  toJSON(): Partial<UserEntity> {
    const { password, ...userData } = this
    return userData
  }
}
