import { IsDefined, IsMongoId, IsString, MaxLength, MinLength } from 'class-validator';

import { CompanyExist } from '../validators/company.validator';

export class CreateCompanyDTO {
	@MaxLength(128)
	@MinLength(1)
	@IsString()
	@IsDefined()
	name: string;

	@CompanyExist()
	@IsMongoId()
	parent?: string;
}
