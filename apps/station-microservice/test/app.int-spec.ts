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
import {shouldBeRpcNotFoundException} from '../../../src/tests/asserts/shouldBeRpcNotFoundException';

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

	describe('Update', () => {
		let station: StationResponse;
		const defaultPayload = {
			name: 'Apple Station',
			latitude: 47.158822701824825,
			longitude: 27.600695367147683,
			company: '65db10f06548ed49254454a0',
			address: 'str. Darmanesti',
		};

		beforeEach(async () => {
			station = await firstValueFrom(
				stationService.Create(defaultPayload),
			);
		});

		it('should throw RpcNotFoundException', (done) => {
			stationService
				.Update({
					...defaultPayload,
					id: '65db233c003af0f3d9c51692',
				})
				.pipe(take(1))
				.subscribe({
					next: () => {
						done('should throw RpcNotFoundException');
					},
					error: (err) => {
						shouldBeRpcNotFoundException(err);
						done();
					},
				});
		});

		describe('should throw RpcBadRequestException', () => {
			const updateWrapper = (done, payload: any) => {
				stationService
					.Update(payload)
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
				updateWrapper(done, {});
			});

			describe('when name', () => {
				it('is empty string', (done) => {
					updateWrapper(done, {
						name: '',
					});
				});

				it('length is bigger than 128', (done) => {
					updateWrapper(done, {
						name: 'A'.repeat(129),
					});
				});
			});

			describe('when latitude', () => {
				it('is string', (done) => {
					updateWrapper(done, {
						latitude: 'string',
					});
				});

				it('is too small', (done) => {
					updateWrapper(done, {
						latitude: -91,
					});
				});

				it('is too big', (done) => {
					updateWrapper(done, {
						latitude: 91,
					});
				});
			});

			describe('when longitude', () => {
				it('is string', (done) => {
					updateWrapper(done, {
						longitude: 'string',
					});
				});

				it('is too small', (done) => {
					updateWrapper(done, {
						latitude: -181,
					});
				});

				it('is too big', (done) => {
					updateWrapper(done, {
						latitude: 181,
					});
				});
			});

			describe('when company', () => {
				it('is is not mongo id', (done) => {
					updateWrapper(done, {
						company: '1',
					});
				});

				it("is doesn't exist", (done) => {
					updateWrapper(done, {
						company: '65db10e66ef55dd08fb3d69f',
					});
				});
			});

			describe('when address', () => {
				it('is empty string', (done) => {
					updateWrapper(done, {
						address: '',
					});
				});

				it('length is bigger than 256', (done) => {
					updateWrapper(done, {
						address: 'A'.repeat(257),
					});
				});
			});
		});

		describe('should update', () => {
			const defaultDoc = {
				name: 'Apple Station',
				location: {
					type: 'Point',
					coordinates: [27.600695367147683, 47.158822701824825],
				},
				company: Types.ObjectId.createFromHexString(
					'65db10f06548ed49254454a0',
				),
				address: 'str. Darmanesti',
			};

			it('name', async () => {
				const result = await firstValueFrom(
					stationService.Update({
						id: station.id,
						name: 'Tesla Station',
					}),
				);

				expect(result).toEqual(
					expect.objectContaining({
						...defaultPayload,
						name: 'Tesla Station',
					}),
				);

				const doc = await model.findById(station.id).lean().exec();

				expect(doc).toEqual(
					expect.objectContaining({
						...defaultDoc,
						name: 'Tesla Station',
					}),
				);
			});

			it('company', async () => {
				const result = await firstValueFrom(
					stationService.Update({
						id: station.id,
						company: '65db2c9e9cc5e873cdd4b9dd',
					}),
				);

				expect(result).toEqual(
					expect.objectContaining({
						...defaultPayload,
						company: '65db2c9e9cc5e873cdd4b9dd',
					}),
				);

				const doc = await model.findById(station.id).lean().exec();

				expect(doc).toEqual(
					expect.objectContaining({
						...defaultDoc,
						company: Types.ObjectId.createFromHexString(
							'65db2c9e9cc5e873cdd4b9dd',
						),
					}),
				);
			});

			it('address', async () => {
				const result = await firstValueFrom(
					stationService.Update({
						id: station.id,
						address: 'blvd. Chimiei',
					}),
				);

				expect(result).toEqual(
					expect.objectContaining({
						...defaultPayload,
						address: 'blvd. Chimiei',
					}),
				);

				const doc = await model.findById(station.id).lean().exec();

				expect(doc).toEqual(
					expect.objectContaining({
						...defaultDoc,
						address: 'blvd. Chimiei',
					}),
				);
			});

			it('latitude', async () => {
				const result = await firstValueFrom(
					stationService.Update({
						id: station.id,
						latitude: 25,
					}),
				);

				expect(result).toEqual(
					expect.objectContaining({
						...defaultPayload,
						latitude: 25,
					}),
				);

				const doc = await model.findById(station.id).lean().exec();

				expect(doc).toEqual(
					expect.objectContaining({
						...defaultDoc,
						location: {
							type: 'Point',
							coordinates: [27.600695367147683, 25],
						},
					}),
				);
			});

			it('longitude', async () => {
				const result = await firstValueFrom(
					stationService.Update({
						id: station.id,
						longitude: 25,
					}),
				);

				expect(result).toEqual(
					expect.objectContaining({
						...defaultPayload,
						longitude: 25,
					}),
				);

				const doc = await model.findById(station.id).lean().exec();

				expect(doc).toEqual(
					expect.objectContaining({
						...defaultDoc,
						location: {
							type: 'Point',
							coordinates: [25, 47.158822701824825],
						},
					}),
				);
			});

			it('multiple fields', async () => {
				const result = await firstValueFrom(
					stationService.Update({
						id: station.id,
						name: 'Romania Station',
						longitude: 25,
						latitude: 25,
					}),
				);

				expect(result).toEqual(
					expect.objectContaining({
						...defaultPayload,
						name: 'Romania Station',
						longitude: 25,
						latitude: 25,
					}),
				);

				const doc = await model.findById(station.id).lean().exec();

				expect(doc).toEqual(
					expect.objectContaining({
						...defaultDoc,
						name: 'Romania Station',
						location: {
							type: 'Point',
							coordinates: [25, 25],
						},
					}),
				);
			});
		});
	});
});
