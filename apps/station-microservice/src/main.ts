import {NestFactory} from '@nestjs/core';
import {StationMicroserviceModule} from './station-microservice.module';

async function bootstrap() {
	const app = await NestFactory.create(StationMicroserviceModule);
	await app.listen(3000);
}
bootstrap();
