import {Controller, Get} from '@nestjs/common';
import {CompanyMicroserviceService} from './company-microservice.service';

@Controller()
export class CompanyMicroserviceController {
	constructor(
		private readonly companyMicroserviceService: CompanyMicroserviceService,
	) {}

	@Get()
	getHello(): string {
		return this.companyMicroserviceService.getHello();
	}
}
