import {INestApplication, ValidationPipe} from '@nestjs/common';
import {ClientGrpc, ClientsModule} from '@nestjs/microservices';
import {MongooseModule, getModelToken} from '@nestjs/mongoose';
import {Test, TestingModule} from '@nestjs/testing';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose, {Model} from 'mongoose';

import {CompanyModule} from '../src/company/company.module';
import {Company} from '../src/company/company.schema';
import type {CompanyService} from '../src/company/company.service';
import {grpcClientOptions} from '../src/options/grpc-client.options';
import {validationOptions} from '../src/options/validation.options';

describe('Company Microservice (integration)', () => {
	let mongod: MongoMemoryServer;
	let app: INestApplication;
	let companyService: CompanyService;
	let moduleFixture: TestingModule;
	let model: Model<Company>;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		const mongoUri = await mongod.getUri();

		moduleFixture = await Test.createTestingModule({
			imports: [
				MongooseModule.forRoot(mongoUri),
				CompanyModule,
				ClientsModule.register([
					{
						...grpcClientOptions,
						name: 'COMPANY_PACKAGE',
					},
				]),
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe(validationOptions));
		app.connectMicroservice(grpcClientOptions, {
			inheritAppConfig: true, // enable global pipes for hybrid app
		});

		model = app.get<Model<Company>>(getModelToken(Company.name));

		await app.startAllMicroservices();
		await app.init();

		const client: ClientGrpc = app.get('COMPANY_PACKAGE');
		companyService = client.getService<CompanyService>('CompanyService');
	});

	afterEach(async () => {
		await model.deleteMany({});
	});

	afterAll(async () => {
		await app.close();
		mongoose.connection.close();
		if (mongod) await mongod.stop();
	});

	it('should boot', () => {
		expect(true).toBeTruthy();
		expect(companyService).toBeDefined();
	});
});
