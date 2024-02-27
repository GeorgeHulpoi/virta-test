import {Injectable} from '@nestjs/common';
import {Types} from 'mongoose';
import {Observable, from} from 'rxjs';

import {RpcBadRequestException} from '../../../../src/shared/exceptions/bad-request.exception';
import {RpcNotFoundException} from '../../../../src/shared/exceptions/not-found.exception';
import {CompanyRepository} from './company.repository';
import {CompanyPOJO} from './company.schema';
import {CreateCompanyDTO} from './dtos/create-company.dto';
import {DeleteCompanyDTO} from './dtos/delete-company.dto';
import {FindCompanyByIdDTO} from './dtos/find-company-by-id.dto';
import {UpdateCompanyByIdDTO} from './dtos/update-company.dto';

@Injectable()
export class CompanyService {
	constructor(private readonly repository: CompanyRepository) {}

	find(): Observable<{data: CompanyPOJO[]}> {
		return from(
			this.repository.find().then((docs) => ({
				data: docs,
			})),
		);
	}

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
		const data: any = restOfDTO;

		if (Object.keys(data).length === 0) {
			throw new RpcBadRequestException();
		}

		if ('parent' in data) {
			data.parent = Types.ObjectId.createFromHexString(data.parent!);
		}

		return from(
			this.repository.findByIdAndUpdate(id, data).then((doc) => {
				if (!doc) throw new RpcNotFoundException();
				return doc;
			}),
		);
	}

	delete(deleteCompanyDTO: DeleteCompanyDTO): Observable<object> {
		const {id} = deleteCompanyDTO;

		const updateParent$ = this.repository.unsetParentToAll(id);

		const delete$ = this.repository.findByIdAndDelete(id).then((doc) => {
			if (!doc) throw new RpcNotFoundException();
		});

		return from(delete$.then(() => updateParent$).then(() => ({})));
	}
}
