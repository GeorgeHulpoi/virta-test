import {Controller, UseFilters} from '@nestjs/common';
import {GrpcMethod} from '@nestjs/microservices';
import {Observable} from 'rxjs';

import {CompanyPOJO} from './company.schema';
import {CompanyService} from './company.service';
import {CreateCompanyDTO} from './dtos/create-company.dto';
import {ExceptionFilter} from './filters/rpc-exception.filter';
import {UpdateCompanyByIdDTO} from './dtos/update-company.dto';

@UseFilters(ExceptionFilter)
@Controller()
export class CompanyController {
	constructor(private readonly companyService: CompanyService) {}

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
}
