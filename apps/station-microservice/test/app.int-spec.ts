import {INestApplication, ValidationPipe} from '@nestjs/common';
import {ClientsModule} from '@nestjs/microservices';
import {MongooseModule, getModelToken} from '@nestjs/mongoose';
import {Test, TestingModule} from '@nestjs/testing';
import {useContainer} from 'class-validator';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose, {Model} from 'mongoose';

import {grpcClientOptions} from '../src/options/grpc-client.options';
import {validationOptions} from '../src/options/validation.options';
import {Station} from '../src/station/station.schema';
import {StationModule} from '../src/station/station.module';

describe('Company Microservice (integration)', () => {
	let mongod: MongoMemoryServer;
	let app: INestApplication;
	let moduleFixture: TestingModule;
	let model: Model<Station>;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		const mongoUri = await mongod.getUri();

		moduleFixture = await Test.createTestingModule({
			imports: [
				MongooseModule.forRoot(mongoUri),
				StationModule,
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

		model = app.get<Model<Station>>(getModelToken(Station.name));

		await app.startAllMicroservices();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
		mongoose.connection.close();
		if (mongod) await mongod.stop();
	});

	afterEach(async () => {
		await model.deleteMany({});
	});

	it('should boot', () => {
		expect(true).toBeTruthy();
	});
});
