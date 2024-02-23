import {Controller, Get} from '@nestjs/common';
import {StationMicroserviceService} from './station-microservice.service';

@Controller()
export class StationMicroserviceController {
	constructor(
		private readonly stationMicroserviceService: StationMicroserviceService,
	) {}

	@Get()
	getHello(): string {
		return this.stationMicroserviceService.getHello();
	}
}
