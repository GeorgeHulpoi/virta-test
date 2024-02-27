import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';

import {Company, CompanyDocument, CompanyPOJO} from './company.schema';
import {RpcInternalException} from '../../../../src/shared/exceptions/internal.exception';
import {CreateCompanyDTO} from './dtos/create-company.dto';

@Injectable()
export class CompanyRepository {
	private readonly logger = new Logger(CompanyRepository.name);

	constructor(
		@InjectModel(Company.name)
		private readonly model: Model<CompanyDocument>,
	) {}

	findById(id: string): Promise<CompanyPOJO | null> {
		return this.model
			.findById(id)
			.lean({virtuals: true})
			.exec()
			.catch(this.catchError.bind(this))
			.then((doc) => {
				if (doc) {
					doc.id = Types.ObjectId.createFromHexString(doc.id);
					delete doc._id;
				}
				return doc;
			});
	}

	findByIdWithChildren(id: string): Promise<CompanyPOJO | null> {
		return this.model
			.aggregate([
				{
					$match: {
						_id: Types.ObjectId.createFromHexString(id),
					},
				},
				{
					$graphLookup: {
						from: 'companies',
						startWith: '$_id',
						connectFromField: '_id',
						connectToField: 'parent',
						as: 'children',
						depthField: 'depth',
					},
				},
			])
			.exec()
			.catch(this.catchError.bind(this))
			.then((docs) => docs[0])
			.then((doc) => {
				if (doc === null || doc === undefined) {
					return null;
				}

				doc = this.virtualizeDoc(doc);
				doc.children = doc.children.map(this.virtualizeDoc);
				return doc;
			});
	}

	create(createCompanyDTO: CreateCompanyDTO): Promise<CompanyPOJO> {
		const company = new this.model(createCompanyDTO);
		return company
			.save()
			.catch(this.catchError.bind(this))
			.then((doc) => doc.toObject());
	}

	virtualizeDoc(doc: CompanyDocument): CompanyDocument {
		if (doc) {
			doc.id = doc._id;
			delete doc._id;
		}
		return doc;
	}

	private catchError(err: Error) {
		this.logger.error(err);
		throw new RpcInternalException();
	}
}
