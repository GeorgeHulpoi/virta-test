import {Module} from '@nestjs/common';
import {StationMicroserviceController} from './station-microservice.controller';
import {StationMicroserviceService} from './station-microservice.service';

@Module({
	imports: [],
	controllers: [StationMicroserviceController],
	providers: [StationMicroserviceService],
})
export class StationMicroserviceModule {}
