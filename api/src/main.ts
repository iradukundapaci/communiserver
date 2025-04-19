import { IAppConfig } from './__shared__/interfaces/app-config.interface';
import { configure } from './__shared__/config/app.config';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configure(app);
  const port = app.get(ConfigService<IAppConfig>).get<number>('port') || 8000;
  await app.listen(port, () =>
    Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap'),
  );
}
void bootstrap();
