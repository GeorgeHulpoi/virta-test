import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Observable, from} from 'rxjs';

import {RpcInternalException} from '../exceptions/internal.exception';
import {Company, CompanyDocument, CompanyPOJO} from './company.schema';
import {CreateCompanyDTO} from './dtos/create-company.dto';

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

	private catchError(err: Error) {
		this.logger.error(err);
		throw new RpcInternalException();
	}
}
