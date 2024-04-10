import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  //! Cross-origin resource sharing (CORS) is a mechanism that allows resources to be requested from another domain. Under the hood
  app.enableCors({
    // Specify the origin(s) allowed for CORS
    origin: 'http://localhost:3000',
    // Allow credentials (cookies, authorization headers) to pass to frontend
    credentials: true
  })
  //! Parses cookies included in the request headers and converts them into a JavaScript object, making it easier for your application to access and manipulate cookie data
  app.use(cookieParser())
  //! The (ValidationPipe) provides a convenient approach to enforce validation rules for all incoming client payloads
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  app.setGlobalPrefix('api')

  await app.listen(3001)
}
bootstrap()
