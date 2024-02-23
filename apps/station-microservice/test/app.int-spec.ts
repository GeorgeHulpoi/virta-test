import {INestApplication, ValidationPipe} from '@nestjs/common';
import {ClientsModule} from '@nestjs/microservices';
import {MongooseModule} from '@nestjs/mongoose';
import {Test, TestingModule} from '@nestjs/testing';
import {useContainer} from 'class-validator';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';

import {grpcClientOptions} from '../src/options/grpc-client.options';
import {validationOptions} from '../src/options/validation.options';

describe('Company Microservice (integration)', () => {
	let mongod: MongoMemoryServer;
	let app: INestApplication;
	let moduleFixture: TestingModule;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		const mongoUri = await mongod.getUri();

		moduleFixture = await Test.createTestingModule({
			imports: [
				MongooseModule.forRoot(mongoUri),
				ClientsModule.register([
					{
						...grpcClientOptions,
						name: 'STATION_PACKAGE',
					},
				]),
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		useContainer(app, {fallbackOnErrors: true});
		app.useGlobalPipes(new ValidationPipe(validationOptions));
		app.connectMicroservice(grpcClientOptions, {
			inheritAppConfig: true, // enable global pipes for hybrid app
		});

		await app.startAllMicroservices();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
		mongoose.connection.close();
		if (mongod) await mongod.stop();
	});

	it('should boot', () => {
		expect(true).toBeTruthy();
	});
});
