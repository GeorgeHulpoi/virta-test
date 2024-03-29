import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {CompanyController} from './company.controller';
import {CompanyRepository} from './company.repository';
import {Company, CompanySchema} from './company.schema';
import {CompanyService} from './company.service';
import {CompanyExistConstraint} from './validators/company.validator';

@Module({
	imports: [
		MongooseModule.forFeature([
			{name: Company.name, schema: CompanySchema},
		]),
	],
	controllers: [CompanyController],
	providers: [CompanyRepository, CompanyService, CompanyExistConstraint],
})
export class CompanyModule {}
