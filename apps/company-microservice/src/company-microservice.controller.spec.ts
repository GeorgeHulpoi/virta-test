import {Test, TestingModule} from '@nestjs/testing';
import {CompanyMicroserviceController} from './company-microservice.controller';
import {CompanyMicroserviceService} from './company-microservice.service';

describe('CompanyMicroserviceController', () => {
	let companyMicroserviceController: CompanyMicroserviceController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [CompanyMicroserviceController],
			providers: [CompanyMicroserviceService],
		}).compile();

		companyMicroserviceController = app.get<CompanyMicroserviceController>(
			CompanyMicroserviceController,
		);
	});

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(companyMicroserviceController.getHello()).toBe(
				'Hello World!',
			);
		});
	});
});
