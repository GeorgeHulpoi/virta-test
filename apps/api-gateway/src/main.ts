import {NestFactory} from '@nestjs/core';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';

import {ApiGatewayModule} from './api-gateway.module';

async function bootstrap() {
	const app = await NestFactory.create(ApiGatewayModule);

	const config = new DocumentBuilder()
		.setTitle('Virta API')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(80);
}
bootstrap();
