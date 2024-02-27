import {MongooseModule, getModelToken} from '@nestjs/mongoose';
import {Test} from '@nestjs/testing';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose, {Model, Types} from 'mongoose';

import {StationRepository} from './station.repository';
import {Station, StationPOJO, StationSchema} from './station.schema';

describe('StationRepository', () => {
	let mongod: MongoMemoryServer;
	let repository: StationRepository;
	let model: Model<Station>;

	beforeEach(async () => {
		mongod = await MongoMemoryServer.create();
		const mongoUri = await mongod.getUri();

		const moduleRef = await Test.createTestingModule({
			imports: [
				MongooseModule.forRoot(mongoUri),
				MongooseModule.forFeature([
					{name: Station.name, schema: StationSchema},
				]),
			],
			providers: [StationRepository],
		}).compile();

		model = moduleRef.get<Model<Station>>(getModelToken(Station.name));
		repository = moduleRef.get<StationRepository>(StationRepository);
	});

	afterEach(async () => {
		await model.deleteMany({});
	});

	afterAll(async () => {
		mongoose.connection.close();
		if (mongod) await mongod.stop();
	});

	describe('mapStationInNearResult', () => {
		let result: any;
		const id = new Types.ObjectId();
		const companyId = new Types.ObjectId();

		beforeEach(() => {
			result = repository.mapStationInNearResult({
				_id: id,
				name: 'Tesla Station',
				location: {
					type: 'Point',
					coordinates: [25, 25],
				},
				distance: 50,
				address: 'Center',
				company: companyId,
			});
		});

		it('should replace id with _id', () => {
			expect(result.id).toEqual(id);
			expect(result._id).toBeUndefined();
		});

		it('should remove location', () => {
			expect(result.location).toBeUndefined();
		});

		it('should remove distance', () => {
			expect(result.distance).toBeUndefined();
		});
	});

	describe('getStationNear', () => {
		const teslaCompanyId = new Types.ObjectId();
		const virtaCompanyId = new Types.ObjectId();
		const appleCompanyId = new Types.ObjectId();

		beforeEach(async () => {
			await model.insertMany([
				{
					name: 'Tesla Station 1',
					location: {
						type: 'Point',
						coordinates: [27.587230065475627, 47.15350910849877],
					},
					company: teslaCompanyId,
					address: 'Center',
				},
				{
					name: 'Apple Station 1',
					location: {
						type: 'Point',
						coordinates: [27.587230065475627, 47.15350910849877],
					},
					company: appleCompanyId,
					address: 'Center',
				},
				{
					name: 'Virta Station 1',
					location: {
						type: 'Point',
						coordinates: [27.587230065475627, 47.15350910849877],
					},
					company: virtaCompanyId,
					address: 'Center',
				},
				{
					name: 'Virta Station 2',
					location: {
						type: 'Point',
						coordinates: [27.533158557705583, 47.17323487126828],
					},
					company: virtaCompanyId,
					address: 'Parcurari',
				},
				{
					name: 'Tesla Station 2',
					location: {
						type: 'Point',
						coordinates: [27.533158557705583, 47.17323487126828],
					},
					company: teslaCompanyId,
					address: 'Parcurari',
				},
			]);
		});

		it('should return all stations grouped', async () => {
			const stations = await repository.getStationNear({
				latitude: 47.15621756421411,
				longitude: 27.587599164378734,
				radius: 10,
			});

			expect(stations).toBeDefined();
			expect(Array.isArray(stations)).toBe(true);
			expect(stations).toHaveLength(2);

			expect(stations[0]).toEqual(
				expect.objectContaining({
					latitude: 47.15350910849877,
					longitude: 27.587230065475627,
					items: expect.anything(),
				}),
			);

			expect(stations[0].items).toContainEqual({
				id: expect.anything(),
				name: 'Tesla Station 1',
				company: teslaCompanyId,
				address: 'Center',
			});

			expect(stations[0].items).toContainEqual({
				id: expect.anything(),
				name: 'Apple Station 1',
				company: appleCompanyId,
				address: 'Center',
			});

			expect(stations[0].items).toContainEqual({
				id: expect.anything(),
				name: 'Virta Station 1',
				company: virtaCompanyId,
				address: 'Center',
			});

			expect(stations[1]).toEqual(
				expect.objectContaining({
					latitude: 47.17323487126828,
					longitude: 27.533158557705583,
					items: expect.anything(),
				}),
			);

			expect(stations[1].items).toContainEqual({
				id: expect.anything(),
				name: 'Tesla Station 2',
				company: teslaCompanyId,
				address: 'Parcurari',
			});

			expect(stations[1].items).toContainEqual({
				id: expect.anything(),
				name: 'Virta Station 2',
				company: virtaCompanyId,
				address: 'Parcurari',
			});
		});

		it('should return company stations grouped', async () => {
			const stations = await repository.getStationNear({
				latitude: 47.15621756421411,
				longitude: 27.587599164378734,
				radius: 10,
				companies: [teslaCompanyId],
			});

			expect(stations).toBeDefined();
			expect(Array.isArray(stations)).toBe(true);
			expect(stations).toHaveLength(2);

			expect(stations[0]).toEqual(
				expect.objectContaining({
					latitude: 47.15350910849877,
					longitude: 27.587230065475627,
					items: expect.anything(),
				}),
			);

			expect(stations[0].items).toHaveLength(1);
			expect(stations[0].items).toContainEqual({
				id: expect.anything(),
				name: 'Tesla Station 1',
				company: teslaCompanyId,
				address: 'Center',
			});

			expect(stations[1]).toEqual(
				expect.objectContaining({
					latitude: 47.17323487126828,
					longitude: 27.533158557705583,
					items: expect.anything(),
				}),
			);

			expect(stations[1].items).toHaveLength(1);
			expect(stations[1].items).toContainEqual({
				id: expect.anything(),
				name: 'Tesla Station 2',
				company: teslaCompanyId,
				address: 'Parcurari',
			});
		});

		it('should return companies stations grouped', async () => {
			const stations = await repository.getStationNear({
				latitude: 47.15621756421411,
				longitude: 27.587599164378734,
				radius: 2,
				companies: [virtaCompanyId, teslaCompanyId],
			});

			expect(stations).toBeDefined();
			expect(Array.isArray(stations)).toBe(true);
			expect(stations).toHaveLength(1);

			expect(stations[0]).toEqual(
				expect.objectContaining({
					latitude: 47.15350910849877,
					longitude: 27.587230065475627,
					items: expect.anything(),
				}),
			);

			expect(stations[0].items).toHaveLength(2);
			expect(stations[0].items).toContainEqual({
				id: expect.anything(),
				name: 'Tesla Station 1',
				company: teslaCompanyId,
				address: 'Center',
			});

			expect(stations[0].items).toContainEqual({
				id: expect.anything(),
				name: 'Virta Station 1',
				company: virtaCompanyId,
				address: 'Center',
			});
		});

		it('should return empty array', async () => {
			const stations = await repository.getStationNear({
				latitude: 47.15621756421411,
				longitude: 27.587599164378734,
				radius: 1000,
				companies: [new Types.ObjectId()],
			});

			expect(stations).toBeDefined();
			expect(Array.isArray(stations)).toBe(true);
			expect(stations).toHaveLength(0);
		});
	});

	describe('create', () => {
		let result: StationPOJO;
		const companyId = new Types.ObjectId();

		beforeEach(async () => {
			result = await repository.create({
				name: 'Tesla Station 1',
				longitude: 25,
				latitude: 47,
				company: companyId.toString(),
				address: 'Center',
			});
		});

		it('should return the created company', () => {
			expect(result).toBeDefined();
			expect(result.id).toBeDefined();
			expect((result as any)._id).toBeUndefined();
			expect(result).toEqual(
				expect.objectContaining({
					name: 'Tesla Station 1',
					longitude: 25,
					latitude: 47,
					company: companyId,
				}),
			);
		});

		it('should create in database', async () => {
			const doc = await model.findById(result.id).lean().exec();

			expect(doc).toBeDefined();
			expect(doc).toEqual(
				expect.objectContaining({
					name: 'Tesla Station 1',
					company: companyId,
					address: 'Center',
					location: {
						type: 'Point',
						coordinates: [25, 47],
					},
				}),
			);
		});
	});
});
