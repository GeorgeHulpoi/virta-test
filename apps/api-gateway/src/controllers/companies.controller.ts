import {
	Body,
	Controller,
	Delete,
	HttpCode,
	Inject,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import {HttpErrorByCode} from '@nestjs/common/utils/http-error-by-code.util';
import {ClientGrpc} from '@nestjs/microservices';
import {ApiResponse} from '@nestjs/swagger';
import {Observable, catchError, throwError} from 'rxjs';

import type {CompanyService} from '../../../company-microservice/src/types';
import {CompanyDTO} from '../dtos/company.dto';
import {CreateCompanyDTO} from '../dtos/create-company.dto';
import {UpdateCompanyDTO} from '../dtos/update-company.dto';

@Controller('api/companies')
export class CompaniesController {
	private companyService: CompanyService;

	constructor(@Inject('COMPANY_PACKAGE') private client: ClientGrpc) {}

	onModuleInit() {
		this.companyService =
			this.client.getService<CompanyService>('CompanyService');
	}

	@Post()
	@HttpCode(201)
	@ApiResponse({
		status: 201,
		description: 'The company has been successfully created.',
		type: CompanyDTO,
	})
	@ApiResponse({
		status: 400,
		description: "The given payload doesn't match the schema.",
	})
	@ApiResponse({status: 500, description: 'Internal Server Error.'})
	create(@Body() createCompanyDTO: CreateCompanyDTO): Observable<CompanyDTO> {
		return this.companyService
			.create(createCompanyDTO)
			.pipe(catchError(this.catchRpcException));
	}

	@Patch(':id')
	@HttpCode(200)
	@ApiResponse({
		status: 200,
		description: 'The company has been successfully updated.',
		type: CompanyDTO,
	})
	@ApiResponse({
		status: 400,
		description: "The given payload doesn't match the schema.",
	})
	@ApiResponse({
		status: 404,
		description: "The resource doesn't exists.",
	})
	@ApiResponse({status: 500, description: 'Internal Server Error.'})
	update(
		@Param('id') id: string,
		@Body() updateCompanyDTO: UpdateCompanyDTO,
	): Observable<CompanyDTO> {
		return this.companyService
			.update({id, ...updateCompanyDTO})
			.pipe(catchError(this.catchRpcException));
	}

	@Delete(':id')
	@HttpCode(200)
	@ApiResponse({
		status: 200,
		description: 'The company has been successfully deleted.',
	})
	@ApiResponse({
		status: 404,
		description: "The resource doesn't exists.",
	})
	@ApiResponse({status: 500, description: 'Internal Server Error.'})
	delete(@Param('id') id: string): Observable<object> {
		return this.companyService
			.delete({id})
			.pipe(catchError(this.catchRpcException));
	}

	private catchRpcException(err): Observable<never> {
		if ('details' in err) {
			const details = JSON.parse(err.details);
			const {
				error: {statusCode},
			} = details;

			if (statusCode in HttpErrorByCode) {
				return throwError(() => new HttpErrorByCode[statusCode]());
			}
		}
		return throwError(() => err);
	}
}
