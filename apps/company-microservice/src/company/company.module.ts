import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {CompanyController} from './company.controller';
import {Company, CompanySchema} from './company.schema';
import {CompanyService} from './company.service';
import {IsEmailAlreadyInUseConstraint} from './validators/company.validator';

@Module({
	imports: [
		MongooseModule.forFeature([
			{name: Company.name, schema: CompanySchema},
		]),
	],
	controllers: [CompanyController],
	providers: [CompanyService, IsEmailAlreadyInUseConstraint],
})
export class CompanyModule {}
