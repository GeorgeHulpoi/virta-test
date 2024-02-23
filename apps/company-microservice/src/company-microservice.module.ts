import {Module} from '@nestjs/common';
import {CompanyMicroserviceController} from './company-microservice.controller';
import {CompanyMicroserviceService} from './company-microservice.service';

@Module({
	imports: [],
	controllers: [CompanyMicroserviceController],
	providers: [CompanyMicroserviceService],
})
export class CompanyMicroserviceModule {}
