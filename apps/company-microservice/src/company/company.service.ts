import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {Observable, from} from 'rxjs';

import {RpcBadRequestException} from '../../../../src/shared/exceptions/bad-request.exception';
import {RpcInternalException} from '../../../../src/shared/exceptions/internal.exception';
import {RpcNotFoundException} from '../../../../src/shared/exceptions/not-found.exception';
import {CompanyRepository} from './company.repository';
import {Company, CompanyDocument, CompanyPOJO} from './company.schema';
import {CreateCompanyDTO} from './dtos/create-company.dto';
import {DeleteCompanyDTO} from './dtos/delete-company.dto';
import {FindCompanyByIdDTO} from './dtos/find-company-by-id.dto';
import {UpdateCompanyByIdDTO} from './dtos/update-company.dto';

@Injectable()
export class CompanyService {
	private readonly logger = new Logger(CompanyService.name);

	constructor(
		@InjectModel(Company.name)
		private readonly model: Model<CompanyDocument>,
		private readonly repository: CompanyRepository,
	) {}

	findById(findCompanyByIdDTO: FindCompanyByIdDTO): Observable<CompanyPOJO> {
		const {id, includeChildren} = findCompanyByIdDTO;
		let doc$: Promise<CompanyPOJO | null>;

		if (includeChildren) {
			doc$ = this.repository.findByIdWithChildren(id);
		} else {
			doc$ = this.repository.findById(id);
		}

		return from(
			doc$.then((doc) => {
				if (!doc) throw new RpcNotFoundException();
				return doc;
			}),
		);
	}

	create(createCompanyDTO: CreateCompanyDTO): Observable<CompanyPOJO> {
		return from(this.repository.create(createCompanyDTO));
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

	delete(deleteCompanyDTO: DeleteCompanyDTO): Observable<object> {
		const {id} = deleteCompanyDTO;

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
