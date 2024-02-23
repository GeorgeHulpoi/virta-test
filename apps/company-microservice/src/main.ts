import {NestFactory} from '@nestjs/core';
import {CompanyMicroserviceModule} from './company-microservice.module';

async function bootstrap() {
	const app = await NestFactory.create(CompanyMicroserviceModule);
	await app.listen(3000);
}
bootstrap();
