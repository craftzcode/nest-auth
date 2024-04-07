import { NestFactory } from '@nestjs/core'

import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  //! Cross-origin resource sharing (CORS) is a mechanism that allows resources to be requested from another domain. Under the hood
  app.enableCors()
  //! Parses cookies included in the request headers and converts them into a JavaScript object, making it easier for your application to access and manipulate cookie data
  app.use(cookieParser())

  await app.listen(3000)
}
bootstrap()
