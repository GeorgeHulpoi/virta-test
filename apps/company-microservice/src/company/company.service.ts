import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {Observable, from} from 'rxjs';

import {RpcBadRequestException} from '../exceptions/bad-request.exception';
import {RpcInternalException} from '../exceptions/internal.exception';
import {RpcNotFoundException} from '../exceptions/not-found.exception';
import {Company, CompanyDocument, CompanyPOJO} from './company.schema';
import {CreateCompanyDTO} from './dtos/create-company.dto';
import {UpdateCompanyByIdDTO} from './dtos/update-company.dto';
import {FindCompanyByIdDTO} from './dtos/find-company-by-id.dto';

@Injectable()
export class CompanyService {
	private readonly logger = new Logger(CompanyService.name);

	constructor(
		@InjectModel(Company.name)
		private readonly model: Model<CompanyDocument>,
	) {}

	getModel(): Model<CompanyDocument> {
		return this.model;
	}

	create(createCompanyDto: CreateCompanyDTO): Observable<CompanyPOJO> {
		const company = new this.model(createCompanyDto);
		return from(company.save().catch(this.catchError.bind(this)));
	}

	update(
		updateCompanyByIdDTO: UpdateCompanyByIdDTO,
	): Observable<CompanyPOJO> {
		const {id, ...restOfDTO} = updateCompanyByIdDTO;

		if (Object.keys(restOfDTO).length === 0) {
			throw new RpcBadRequestException();
		}

		return from(
			this.model
				.findByIdAndUpdate(
					id,
					{$set: restOfDTO},
					{
						returnDocument: 'after',
						lean: {virtuals: true},
					},
				)
				.exec()
				.catch(this.catchError.bind(this))
				.then((doc) => {
					if (!doc) throw new RpcNotFoundException();
					delete doc._id;
					return doc;
				}),
		);
	}

	delete(findCompanyByIdDTO: FindCompanyByIdDTO): Observable<object> {
		const {id} = findCompanyByIdDTO;

		const updateParent$ = this.model
			.updateMany(
				{
					parent: Types.ObjectId.createFromHexString(id),
				},
				{
					$unset: {
						parent: '',
					},
				},
			)
			.exec()
			.catch(this.catchError.bind(this));

		const delete$ = this.model
			.findByIdAndDelete(id)
			.exec()
			.catch(this.catchError.bind(this))
			.then((doc) => {
				if (!doc) throw new RpcNotFoundException();
			});

		return from(delete$.then(() => updateParent$).then(() => ({})));
	}

	private catchError(err: Error) {
		this.logger.error(err);
		throw new RpcInternalException();
	}
}
