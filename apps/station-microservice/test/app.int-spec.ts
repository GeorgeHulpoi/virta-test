import {INestApplication, ValidationPipe} from '@nestjs/common';
import {ClientGrpc, ClientsModule} from '@nestjs/microservices';
import {MongooseModule, getModelToken} from '@nestjs/mongoose';
import {Test, TestingModule} from '@nestjs/testing';
import {useContainer} from 'class-validator';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose, {Model, Types} from 'mongoose';
import {firstValueFrom, take} from 'rxjs';

import {shouldBeRpcBadRequestException} from '../../../src/tests/asserts/shouldBeRpcBadExceptionException';
import {grpcClientOptions} from '../src/options/grpc-client.options';
import {validationOptions} from '../src/options/validation.options';
import {StationModule} from '../src/station/station.module';
import {Station} from '../src/station/station.schema';
import type {Station as StationResponse, StationService} from '../src/types';
import {companyPackageMock} from '../src/station/validators/company-package.mock';

describe('Station Microservice (integration)', () => {
	let mongod: MongoMemoryServer;
	let app: INestApplication;
	let moduleFixture: TestingModule;
	let model: Model<Station>;
	let stationService: StationService;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		const mongoUri = await mongod.getUri();

		moduleFixture = await Test.createTestingModule({
			imports: [
				MongooseModule.forRoot(mongoUri),
				StationModule.register({
					providers: [
						{
							provide: 'COMPANY_PACKAGE',
							useValue: companyPackageMock,
						},
					],
				}),
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

		const client: ClientGrpc = app.get('STATION_PACKAGE');
		stationService = client.getService<StationService>('StationService');
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
		expect(stationService).toBeDefined();
	});

	describe('Create', () => {
		const defaultPayload = {
			name: 'Apple Station',
			latitude: 47.158822701824825,
			longitude: 27.600695367147683,
			company: '65db10f06548ed49254454a0',
			address: 'str. Darmanesti',
		};

		describe('should throw RpcBadRequestException', () => {
			const createWrapper = (done, payload: any) => {
				stationService
					.Create(payload)
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

			describe('when name', () => {
				it('is undefined', (done) => {
					createWrapper(done, {
						...defaultPayload,
						name: undefined,
					});
				});

				it('is empty string', (done) => {
					createWrapper(done, {
						...defaultPayload,
						name: '',
					});
				});

				it('length is bigger than 128', (done) => {
					createWrapper(done, {
						...defaultPayload,
						name: 'A'.repeat(129),
					});
				});
			});

			describe('when latitude', () => {
				it('is undefined', (done) => {
					createWrapper(done, {
						...defaultPayload,
						latitude: undefined,
					});
				});

				it('is string', (done) => {
					createWrapper(done, {
						...defaultPayload,
						latitude: 'string',
					});
				});

				it('is too small', (done) => {
					createWrapper(done, {
						...defaultPayload,
						latitude: -91,
					});
				});

				it('is too big', (done) => {
					createWrapper(done, {
						...defaultPayload,
						latitude: 91,
					});
				});
			});

			describe('when longitude', () => {
				it('is undefined', (done) => {
					createWrapper(done, {
						...defaultPayload,
						longitude: undefined,
					});
				});

				it('is string', (done) => {
					createWrapper(done, {
						...defaultPayload,
						longitude: 'string',
					});
				});

				it('is too small', (done) => {
					createWrapper(done, {
						...defaultPayload,
						latitude: -181,
					});
				});

				it('is too big', (done) => {
					createWrapper(done, {
						...defaultPayload,
						latitude: 181,
					});
				});
			});

			describe('when company', () => {
				it('is undefined', (done) => {
					createWrapper(done, {
						...defaultPayload,
						company: undefined,
					});
				});

				it('is is not mongo id', (done) => {
					createWrapper(done, {
						...defaultPayload,
						company: '1',
					});
				});

				it("is doesn't exist", (done) => {
					createWrapper(done, {
						...defaultPayload,
						company: '65db10e66ef55dd08fb3d69f',
					});
				});
			});

			describe('when address', () => {
				it('is undefined', (done) => {
					createWrapper(done, {
						...defaultPayload,
						address: undefined,
					});
				});

				it('is empty string', (done) => {
					createWrapper(done, {
						...defaultPayload,
						address: '',
					});
				});

				it('length is bigger than 256', (done) => {
					createWrapper(done, {
						...defaultPayload,
						address: 'A'.repeat(257),
					});
				});
			});
		});

		describe('should create station', () => {
			let station: StationResponse;

			beforeEach(async () => {
				station = await firstValueFrom(
					stationService.Create(defaultPayload),
				);
			});

			it('and return it', async () => {
				expect(station).toBeDefined();
				expect(station).toEqual({
					id: expect.any(String),
					...defaultPayload,
				});
			});

			it('and exist in database', async () => {
				const doc = await model.findById(station.id).lean().exec();
				expect(doc).toBeDefined();
				expect(doc).toEqual(
					expect.objectContaining({
						_id: Types.ObjectId.createFromHexString(station.id),
						name: defaultPayload.name,
						company: Types.ObjectId.createFromHexString(
							defaultPayload.company,
						),
						address: defaultPayload.address,
						location: {
							type: 'Point',
							coordinates: [
								defaultPayload.longitude,
								defaultPayload.latitude,
							],
						},
					}),
				);
			});
		});
	});
});
