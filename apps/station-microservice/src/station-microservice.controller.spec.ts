import {Test, TestingModule} from '@nestjs/testing';
import {StationMicroserviceController} from './station-microservice.controller';
import {StationMicroserviceService} from './station-microservice.service';

describe('StationMicroserviceController', () => {
	let stationMicroserviceController: StationMicroserviceController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [StationMicroserviceController],
			providers: [StationMicroserviceService],
		}).compile();

		stationMicroserviceController = app.get<StationMicroserviceController>(
			StationMicroserviceController,
		);
	});

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(stationMicroserviceController.getHello()).toBe(
				'Hello World!',
			);
		});
	});
});
