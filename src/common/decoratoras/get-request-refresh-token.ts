import { Request } from 'express'

import {
  //! (createParamDecorator) Is a method provided by the (@nestjs/common) module that allows you to create custom parameter decorators for your controllers and handlers
  //! Parameter decorators are used to extract data from the request object or perform certain actions based on the parameters passed to a route handler method
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common'

export const GetRequestRefreshToken = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>()
    const { jwtRefreshToken } = request.cookies

    return jwtRefreshToken
  }
)
