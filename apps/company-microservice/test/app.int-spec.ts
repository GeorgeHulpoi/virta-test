import {INestApplication, INestMicroservice} from '@nestjs/common';
import {ClientGrpc, ClientsModule} from '@nestjs/microservices';
import {Test, TestingModule} from '@nestjs/testing';

import {CompanyModule} from '../src/company/company.module';
import type {CompanyService} from '../src/company/company.service';
import {grpcClientOptions} from '../src/options/grpc-client.options';

describe('Company Microservice (integration)', () => {
	let app: INestApplication;
	let microservice: INestMicroservice;
	let companyService: CompanyService;
	let moduleFixture: TestingModule;

	beforeAll(async () => {
		moduleFixture = await Test.createTestingModule({
			imports: [
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
		microservice = app.connectMicroservice(grpcClientOptions, {
			inheritAppConfig: true, // enable global pipes for hybrid app
		});

		await app.startAllMicroservices();
		await app.init();

		const client: ClientGrpc = app.get('COMPANY_PACKAGE');
		companyService = client.getService<CompanyService>('CompanyService');
	});

	afterAll(async () => {
		await app.close();
	});

	it('should boot', () => {
		expect(true).toBeTruthy();
		expect(companyService).toBeDefined();
	});
});
