import {Controller, UseFilters} from '@nestjs/common';
import {GrpcMethod} from '@nestjs/microservices';
import {Observable} from 'rxjs';

import {ExceptionFilter} from '../../../../src/shared/filters/rpc-exception.filter';
import {CompanyPOJO} from './company.schema';
import {CompanyService} from './company.service';
import {CreateCompanyDTO} from './dtos/create-company.dto';
import {DeleteCompanyDTO} from './dtos/delete-company.dto';
import {FindCompanyByIdDTO} from './dtos/find-company-by-id.dto';
import {UpdateCompanyByIdDTO} from './dtos/update-company.dto';

@UseFilters(ExceptionFilter)
@Controller()
export class CompanyController {
	constructor(private readonly companyService: CompanyService) {}

	@GrpcMethod('CompanyService', 'FindById')
	findByid(findCompanyByIdDTO: FindCompanyByIdDTO): Observable<CompanyPOJO> {
		return this.companyService.findById(findCompanyByIdDTO);
	}

	@GrpcMethod('CompanyService', 'Create')
	create(createCompanyDto: CreateCompanyDTO): Observable<CompanyPOJO> {
		return this.companyService.create(createCompanyDto);
	}

	@GrpcMethod('CompanyService', 'Update')
	update(
		updateCompanyByIdDTO: UpdateCompanyByIdDTO,
	): Observable<CompanyPOJO> {
		return this.companyService.update(updateCompanyByIdDTO);
	}

	@GrpcMethod('CompanyService', 'Delete')
	delete(deleteCompanyDTO: DeleteCompanyDTO): Observable<object> {
		return this.companyService.delete(deleteCompanyDTO);
	}
}
