import {MongooseModule, getModelToken} from '@nestjs/mongoose';
import {Test} from '@nestjs/testing';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose, {Model, Types} from 'mongoose';

import {CompanyRepository} from './company.repository';
import {Company, CompanyPOJO, CompanySchema} from './company.schema';

describe('CompanyRepository', () => {
	let mongod: MongoMemoryServer;
	let repository: CompanyRepository;
	let model: Model<Company>;

	beforeEach(async () => {
		mongod = await MongoMemoryServer.create();
		const mongoUri = await mongod.getUri();

		const moduleRef = await Test.createTestingModule({
			imports: [
				MongooseModule.forRoot(mongoUri),
				MongooseModule.forFeature([
					{name: Company.name, schema: CompanySchema},
				]),
			],
			providers: [CompanyRepository],
		}).compile();

		model = moduleRef.get<Model<Company>>(getModelToken(Company.name));
		repository = moduleRef.get<CompanyRepository>(CompanyRepository);
	});

	afterEach(async () => {
		await model.deleteMany({});
	});

	afterAll(async () => {
		mongoose.connection.close();
		if (mongod) await mongod.stop();
	});

	describe('virtualizeDoc', () => {
		it('should use id instead of _id', () => {
			const objectId = Types.ObjectId.createFromHexString(
				'65dcec4410bafd358172bafb',
			);
			const docStub = {
				_id: objectId,
				name: 'Apple',
			};

			const result = repository.virtualizeDoc(docStub as any);

			expect(result).toEqual({
				id: objectId,
				name: 'Apple',
			});
		});
	});

	describe('findById', () => {
		beforeEach(async () => {
			await model.insertMany([
				{
					_id: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
					name: 'Microsoft',
				},
				{
					_id: Types.ObjectId.createFromHexString(
						'65dceca410bafd358172baff',
					),
					name: 'Azure',
					parent: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
				},
			]);
		});

		it('should return doc', async () => {
			const doc = await repository.findById('65dceca410bafd358172baff');

			expect(doc).toBeDefined();
			expect(doc).toEqual(
				expect.objectContaining({
					id: Types.ObjectId.createFromHexString(
						'65dceca410bafd358172baff',
					),
					name: 'Azure',
					parent: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
				}),
			);
		});

		it('should return null', async () => {
			const doc = await repository.findById('65dceca410bafd358172baaa');
			expect(doc).toBeNull();
		});
	});

	describe('findByIdWithChildren', () => {
		beforeEach(async () => {
			await model.insertMany([
				{
					_id: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
					name: 'Microsoft',
				},
				{
					_id: Types.ObjectId.createFromHexString(
						'65dceca410bafd358172baff',
					),
					name: 'Azure',
					parent: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
				},
				{
					name: 'Skype',
					parent: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
				},
				{
					name: 'Azure Sub-company',
					parent: Types.ObjectId.createFromHexString(
						'65dceca410bafd358172baff',
					),
				},
			]);
		});

		it('should return with children', async () => {
			const doc = await repository.findByIdWithChildren(
				'65dcec4410bafd358172bafb',
			);

			expect(doc).toEqual(
				expect.objectContaining({
					id: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
					name: 'Microsoft',
					children: expect.anything(),
				}),
			);

			expect(Array.isArray(doc.children)).toBe(true);

			expect(doc.children).toContainEqual(
				expect.objectContaining({
					id: Types.ObjectId.createFromHexString(
						'65dceca410bafd358172baff',
					),
					name: 'Azure',
					parent: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
					depth: 0,
				}),
			);

			expect(doc.children).toContainEqual(
				expect.objectContaining({
					id: expect.anything(),
					name: 'Skype',
					parent: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
				}),
			);

			expect(doc.children).toContainEqual(
				expect.objectContaining({
					name: 'Azure Sub-company',
					parent: Types.ObjectId.createFromHexString(
						'65dceca410bafd358172baff',
					),
				}),
			);
		});

		it('should return with children 2', async () => {
			const doc = await repository.findByIdWithChildren(
				'65dceca410bafd358172baff',
			);

			expect(doc).toEqual(
				expect.objectContaining({
					id: Types.ObjectId.createFromHexString(
						'65dceca410bafd358172baff',
					),
					name: 'Azure',
					parent: Types.ObjectId.createFromHexString(
						'65dcec4410bafd358172bafb',
					),
					children: expect.anything(),
				}),
			);

			expect(Array.isArray(doc.children)).toBe(true);

			expect(doc.children).toContainEqual(
				expect.objectContaining({
					name: 'Azure Sub-company',
					parent: Types.ObjectId.createFromHexString(
						'65dceca410bafd358172baff',
					),
				}),
			);
		});

		it('should return null when not found', async () => {
			const doc = await repository.findByIdWithChildren(
				'65dcec4410bafd358172baaa',
			);

			expect(doc).toBeNull();
		});
	});

	describe('create', () => {
		let result: CompanyPOJO;

		beforeEach(async () => {
			result = await repository.create({
				name: 'Apple',
			});
		});

		it('should return the created company', () => {
			expect(result).toBeDefined();
			expect(result.id).toBeDefined();
			expect((result as any)._id).toBeUndefined();
		});

		it('should create in database', async () => {
			const doc = await model.findById(result.id).lean().exec();

			expect(doc).toBeDefined();
			expect(doc).toEqual(
				expect.objectContaining({
					name: 'Apple',
				}),
			);
		});
	});

	describe('findByIdAndUpdate', () => {
		let company: CompanyPOJO;

		beforeEach(async () => {
			company = await repository.create({
				name: 'Apple',
			});
		});

		it('should update', async () => {
			const result = await repository.findByIdAndUpdate(company.id, {
				name: 'Z (formerly Apple)',
			});
			expect(result).toBeDefined();
			expect(result).toEqual(
				expect.objectContaining({
					id: company.id,
					name: 'Z (formerly Apple)',
				}),
			);
		});

		it("should return null when doesn't exist", async () => {
			const result = await repository.findByIdAndUpdate(
				new Types.ObjectId(),
				{name: 'Microsoft'},
			);
			expect(result).toBeNull();
		});
	});
});
