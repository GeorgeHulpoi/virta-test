import {IsDefined, IsString, MaxLength, MinLength} from 'class-validator';

import {IsObjectId} from '../../../../../src/shared/validators/objectid.validator';
import {CompanyExist} from '../validators/company.validator';

export class CreateCompanyDTO {
	@MaxLength(128)
	@MinLength(1)
	@IsString()
	@IsDefined()
	name: string;

	@CompanyExist()
	@IsObjectId()
	parent?: string;
}
