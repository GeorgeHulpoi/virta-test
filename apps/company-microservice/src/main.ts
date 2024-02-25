import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {MicroserviceOptions} from '@nestjs/microservices';
import {useContainer} from 'class-validator';

import {AppModule} from './app.module';
import {CompanyModule} from './company/company.module';
import {grpcClientOptions} from './options/grpc-client.options';
import {validationOptions} from './options/validation.options';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		AppModule,
		grpcClientOptions(`0.0.0.0:${process.env.PORT}`),
	);

	useContainer(app.select(CompanyModule), {fallbackOnErrors: true});
	app.useGlobalPipes(new ValidationPipe(validationOptions));

	await app.listen();
}
bootstrap();
