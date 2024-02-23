import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {MicroserviceOptions} from '@nestjs/microservices';

import {AppModule} from './app.module';
import {grpcClientOptions} from './options/grpc-client.options';
import {validationOptions} from './options/validation.options';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		AppModule,
		grpcClientOptions,
	);

	app.useGlobalPipes(new ValidationPipe(validationOptions));

	await app.listen();
}
bootstrap();
