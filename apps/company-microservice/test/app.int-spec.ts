import {status} from '@grpc/grpc-js';
import {INestApplication, ValidationPipe} from '@nestjs/common';
import {ClientGrpc, ClientsModule} from '@nestjs/microservices';
import {MongooseModule, getModelToken} from '@nestjs/mongoose';
import {Test, TestingModule} from '@nestjs/testing';
import {useContainer} from 'class-validator';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose, {Model, Types} from 'mongoose';
import {firstValueFrom, take} from 'rxjs';

import {CompanyModule} from '../src/company/company.module';
import {Company, CompanyPOJO} from '../src/company/company.schema';
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
		useContainer(app, {fallbackOnErrors: true});
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

	describe('Create', () => {
		describe('should throw RpcBadRequestException', () => {
			const createWrapper = (done, payload: any) => {
				companyService
					.create(payload)
					.pipe(take(1))
					.subscribe({
						next: () => {
							done('should throw RpcBadRequestException');
						},
						error: (err) => {
							shouldBeRpcBadRequestException(err);
							done();
						},
					});
			};

			it('when empty', (done) => {
				createWrapper(done, {});
			});

			it('when name is empy string', (done) => {
				createWrapper(done, {name: ''});
			});

			it('when name length is bigger than 128', (done) => {
				createWrapper(done, {
					name: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
				});
			});

			it('when parent is not a valid object id', (done) => {
				createWrapper(done, {name: 'Test', parent: 1});
			});

			it("when parent doesn't exist", (done) => {
				createWrapper(done, {
					name: 'Test',
					parent: '65d88c21e9d9594fba4b9a04',
				});
			});
		});

		describe('should create company', () => {
			let company: CompanyPOJO;

			beforeEach(async () => {
				company = await firstValueFrom(
					companyService.create({
						name: 'Apple',
					}),
				);
			});

			it('and return it', async () => {
				expect(company).toBeDefined();
				expect(company).toEqual({
					id: expect.any(String),
					name: 'Apple',
				});
			});

			it('and exist in database', async () => {
				const doc = await model.findById(company.id).lean().exec();
				expect(doc).toBeDefined();
				expect(doc).toEqual(
					expect.objectContaining({
						name: 'Apple',
					}),
				);
			});
		});

		describe('should crate company with parent', () => {
			let parentCompany: CompanyPOJO;
			let company: CompanyPOJO;

			beforeEach(async () => {
				parentCompany = await firstValueFrom(
					companyService.create({
						name: 'Microsoft',
					}),
				);

				company = await firstValueFrom(
					companyService.create({
						name: 'Skype',
						parent: parentCompany.id,
					}),
				);
			});

			it('and return it', async () => {
				expect(company).toBeDefined();
				expect(company).toEqual({
					id: expect.any(String),
					name: 'Skype',
					parent: parentCompany.id,
				});
			});

			it('and exist in database', async () => {
				const doc = await model.findById(company.id).lean().exec();
				expect(doc).toBeDefined();
				expect(doc).toEqual(
					expect.objectContaining({
						name: 'Skype',
						parent: Types.ObjectId.createFromHexString(
							parentCompany.id,
						),
					}),
				);
			});
		});
	});
});

function shouldBeRpcBadRequestException(err) {
	expect(err).toBeInstanceOf(Error);
	expect(err.code).toEqual(status.UNKNOWN);
	expect(err.details).toBeDefined();
	const details = JSON.parse(err.details);
	expect(details.error?.statusCode).toEqual(400);
	expect(details.type).toEqual('object');
}
