import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Inject,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import {ClientGrpc} from '@nestjs/microservices';
import {ApiResponse} from '@nestjs/swagger';
import {Observable, catchError, map} from 'rxjs';

import type {CompanyService} from '../../../company-microservice/src/types';
import {catchRpcException} from '../catchRpcException';
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

	@Get()
	@ApiResponse({
		status: 200,
		type: [CompanyDTO],
	})
	@ApiResponse({status: 500, description: 'Internal Server Error.'})
	find(): Observable<CompanyDTO[]> {
		return this.companyService.Find({}).pipe(
			map((result) => result.data),
			catchError(catchRpcException),
		);
	}

	@Get(':id')
	@HttpCode(200)
	@ApiResponse({
		status: 200,
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
	findById(@Param('id') id: string): Observable<CompanyDTO> {
		return this.companyService
			.FindById({id})
			.pipe(catchError(catchRpcException));
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
			.Create(createCompanyDTO)
			.pipe(catchError(catchRpcException));
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
			.Update({id, ...updateCompanyDTO})
			.pipe(catchError(catchRpcException));
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
			.Delete({id})
			.pipe(catchError(catchRpcException));
	}
}
