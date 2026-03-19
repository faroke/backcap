import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`NestJS Blog listening on http://localhost:${port}`);
}

bootstrap();
